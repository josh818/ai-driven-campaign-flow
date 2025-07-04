import React from 'react';

const App = () => {
  console.log("Simple App rendering");
  
  return (
    <div style={{ 
      padding: '40px', 
      fontSize: '24px', 
      textAlign: 'center',
      backgroundColor: '#f0f8ff',
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center'
    }}>
      <h1 style={{ color: '#2563eb', marginBottom: '20px' }}>BiggerBite.io</h1>
      <p style={{ color: '#64748b', marginBottom: '30px' }}>Professional Campaign Management</p>
      
      <div style={{ 
        display: 'flex', 
        gap: '20px', 
        flexWrap: 'wrap',
        justifyContent: 'center'
      }}>
        <button 
          onClick={() => console.log('Get Started clicked')}
          style={{
            backgroundColor: '#2563eb',
            color: 'white',
            padding: '12px 24px',
            border: 'none',
            borderRadius: '8px',
            fontSize: '16px',
            cursor: 'pointer'
          }}
        >
          Get Started - $1,500/month
        </button>
        
        <button 
          onClick={() => console.log('Login clicked')}
          style={{
            backgroundColor: 'white',
            color: '#2563eb',
            padding: '12px 24px',
            border: '2px solid #2563eb',
            borderRadius: '8px',
            fontSize: '16px',
            cursor: 'pointer'
          }}
        >
          Login
        </button>
      </div>
      
      <div style={{ marginTop: '40px', textAlign: 'center' }}>
        <h3 style={{ color: '#1f2937', marginBottom: '15px' }}>Professional Marketing Excellence</h3>
        <p style={{ color: '#6b7280', maxWidth: '600px' }}>
          Your marketing campaigns deserve the expertise of professionals with over 20 years of proven success. 
          Every strategy is backed by decades of experience.
        </p>
      </div>
    </div>
  );
};

export default App;