import React, { useState, useRef, useEffect } from 'react';
import { FiCamera, FiX, FiCheck, FiAlertCircle, FiRefreshCw } from 'react-icons/fi';
import { QRCodeService, type TicketQRData } from '../services/qrCodeService';

interface QRScannerProps {
  onScanSuccess: (data: TicketQRData) => void;
  onScanError: (error: string) => void;
  onClose: () => void;
  isOpen: boolean;
  eventId?: string;
}

interface ScanResult {
  success: boolean;
  message: string;
  data?: TicketQRData;
}

const QRScanner: React.FC<QRScannerProps> = ({ 
  onScanSuccess, 
  onScanError, 
  onClose, 
  isOpen 
}) => {
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [cameraError, setCameraError] = useState<string>('');
  const [stream, setStream] = useState<MediaStream | null>(null);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scanIntervalRef = useRef<number | null>(null);

  // Start camera and scanning
  const startScanning = async () => {
    try {
      setCameraError('');
      setIsScanning(true);

      // Request camera permission
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: 'environment', // Use back camera if available
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      });

      setStream(mediaStream);

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.play();

        // Start scanning interval
        scanIntervalRef.current = setInterval(() => {
          scanQRCode();
        }, 500); // Scan every 500ms
      }

    } catch (error) {
      console.error('Camera access error:', error);
      setCameraError('Tidak dapat mengakses kamera. Pastikan izin kamera telah diberikan.');
      setIsScanning(false);
    }
  };

  // Stop camera and scanning
  const stopScanning = () => {
    setIsScanning(false);
    
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current);
      scanIntervalRef.current = null;
    }

    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  // Scan QR code from video
  const scanQRCode = async () => {
    if (!videoRef.current || !canvasRef.current || !isScanning) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    if (!context || video.readyState !== video.HAVE_ENOUGH_DATA) return;

    // Set canvas size to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw video frame to canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    try {
      // Use a QR code library to decode (you'll need to install jsqr or similar)
      // For now, we'll simulate QR detection
      await simulateQRDetection(canvas);

    } catch (error) {
      console.error('QR scanning error:', error);
    }
  };

  // Simulate QR code detection (replace with actual QR library)
  const simulateQRDetection = async (_canvas: HTMLCanvasElement) => {
    // This is a placeholder - in real implementation, use jsqr or similar library
    // const code = jsQR(imageData.data, imageData.width, imageData.height);
    
    // For demo purposes, we'll create a mock detection
    // In real app, replace this with actual QR detection logic
  };

  // Process scanned QR data
  const processQRData = (qrString: string) => {
    try {
      const qrData = QRCodeService.validateQRData(qrString);
      
      if (!qrData) {
        setScanResult({
          success: false,
          message: 'QR Code tidak valid atau format salah'
        });
        onScanError('QR Code tidak valid');
        return;
      }

      // Check if QR is expired (optional)
      if (QRCodeService.isQRExpired(qrData, 48)) { // 48 hours expiry
        setScanResult({
          success: false,
          message: 'QR Code sudah kadaluarsa'
        });
        onScanError('QR Code sudah kadaluarsa');
        return;
      }

      // Success
      setScanResult({
        success: true,
        message: `Tiket valid untuk ${qrData.participantName}`,
        data: qrData
      });

      onScanSuccess(qrData);
      
      // Auto close after success
      setTimeout(() => {
        handleClose();
      }, 2000);

    } catch (error) {
      console.error('Error processing QR data:', error);
      setScanResult({
        success: false,
        message: 'Gagal memproses QR Code'
      });
      onScanError('Gagal memproses QR Code');
    }
  };

  // Handle manual QR input (for testing)
  const handleManualInput = () => {
    const testQRData = {
      ticketId: 'test-123',
      ticketNumber: 'TKT-001',
      participantName: 'John Doe',
      participantEmail: 'john@example.com',
      eventTitle: 'Test Event',
      eventDate: '2024-01-15',
      ticketCategory: 'Regular',
      timestamp: new Date().toISOString()
    };
    
    processQRData(JSON.stringify(testQRData));
  };

  // Close scanner
  const handleClose = () => {
    stopScanning();
    setScanResult(null);
    setCameraError('');
    onClose();
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopScanning();
    };
  }, []);

  // Auto start scanning when opened
  useEffect(() => {
    if (isOpen && !isScanning && !cameraError) {
      startScanning();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="bg-blue-600 text-white p-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <FiCamera size={20} />
            <h2 className="text-lg font-semibold">Scan QR Code</h2>
          </div>
          <button
            onClick={handleClose}
            className="p-1 hover:bg-blue-700 rounded-full transition-colors"
          >
            <FiX size={20} />
          </button>
        </div>

        {/* Scanner Content */}
        <div className="p-4">
          {cameraError ? (
            <div className="text-center py-8">
              <FiAlertCircle className="mx-auto text-red-500 mb-4" size={48} />
              <p className="text-red-600 mb-4">{cameraError}</p>
              <button
                onClick={startScanning}
                className="flex items-center gap-2 mx-auto px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <FiRefreshCw size={16} />
                Coba Lagi
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Video Preview */}
              <div className="relative bg-gray-900 rounded-lg overflow-hidden aspect-square">
                <video
                  ref={videoRef}
                  className="w-full h-full object-cover"
                  playsInline
                  muted
                />
                <canvas
                  ref={canvasRef}
                  className="hidden"
                />
                
                {/* Scanning Overlay */}
                {isScanning && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="border-2 border-white border-dashed w-48 h-48 rounded-lg animate-pulse">
                      <div className="absolute top-2 left-2 w-6 h-6 border-t-2 border-l-2 border-blue-400"></div>
                      <div className="absolute top-2 right-2 w-6 h-6 border-t-2 border-r-2 border-blue-400"></div>
                      <div className="absolute bottom-2 left-2 w-6 h-6 border-b-2 border-l-2 border-blue-400"></div>
                      <div className="absolute bottom-2 right-2 w-6 h-6 border-b-2 border-r-2 border-blue-400"></div>
                    </div>
                  </div>
                )}
              </div>

              {/* Instructions */}
              <div className="text-center text-gray-600">
                <p className="text-sm">
                  Arahkan kamera ke QR code pada tiket
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Pastikan QR code terlihat jelas dalam frame
                </p>
              </div>

              {/* Scan Result */}
              {scanResult && (
                <div className={`p-4 rounded-lg border-2 ${
                  scanResult.success 
                    ? 'bg-green-50 border-green-200 text-green-800' 
                    : 'bg-red-50 border-red-200 text-red-800'
                }`}>
                  <div className="flex items-center gap-2 mb-2">
                    {scanResult.success ? (
                      <FiCheck className="text-green-600" size={20} />
                    ) : (
                      <FiAlertCircle className="text-red-600" size={20} />
                    )}
                    <span className="font-semibold">
                      {scanResult.success ? 'Berhasil!' : 'Gagal!'}
                    </span>
                  </div>
                  <p className="text-sm">{scanResult.message}</p>
                  
                  {scanResult.success && scanResult.data && (
                    <div className="mt-3 pt-3 border-t border-green-200">
                      <p className="text-xs">
                        <strong>Peserta:</strong> {scanResult.data.participantName}
                      </p>
                      <p className="text-xs">
                        <strong>Kategori:</strong> {scanResult.data.ticketCategory}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={handleClose}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Tutup
                </button>
                
                {/* Test Button (for development) */}
                <button
                  onClick={handleManualInput}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm"
                >
                  Test QR
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default QRScanner;
