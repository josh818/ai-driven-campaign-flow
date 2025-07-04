import React from 'react';

const App = () => {
  console.log('App component rendering');
  return (
    <div style={{ padding: '20px', fontSize: '24px', color: 'blue' }}>
      <h1>BiggerBite.io - App is Working!</h1>
      <p>If you see this, React is loading properly.</p>
    </div>
  );
};

export default App;