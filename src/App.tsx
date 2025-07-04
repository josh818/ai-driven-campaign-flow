import React from 'react';

// Simple test component
const TestComponent = () => {
  console.log("TestComponent is rendering");
  return (
    <div style={{ 
      padding: '20px', 
      fontSize: '24px', 
      color: 'blue',
      backgroundColor: '#f0f0f0',
      border: '2px solid red'
    }}>
      <h1>TEST: BiggerBite.io is Loading</h1>
      <p>If you see this, React is working.</p>
      <p>Check the console for logs.</p>
    </div>
  );
};

const App = () => {
  console.log("App component is rendering");
  return <TestComponent />;
};

export default App;