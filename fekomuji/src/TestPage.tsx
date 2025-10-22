import React from 'react';

const TestPage: React.FC = () => {
  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <h1>🎉 React App is Working!</h1>
      <p>If you can see this, React is rendering correctly.</p>
      <div style={{ marginTop: '20px', padding: '10px', backgroundColor: '#f0f0f0', borderRadius: '8px' }}>
        <h2>Debug Info:</h2>
        <p>✅ React components loading</p>
        <p>✅ TypeScript compiling</p>
        <p>✅ No critical import errors</p>
      </div>
    </div>
  );
};

export default TestPage;
