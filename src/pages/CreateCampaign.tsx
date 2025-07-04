import React from 'react';
import { useAuth } from '@/hooks/useAuth';

const CreateCampaign = () => {
  const { user } = useAuth();
  
  console.log('CreateCampaign component rendering');
  console.log('User:', user);
  
  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: 'white', 
      padding: '20px',
      color: 'black',
      fontSize: '18px'
    }}>
      <h1 style={{ color: 'red', fontSize: '32px', marginBottom: '20px' }}>
        CREATE CAMPAIGN PAGE TEST
      </h1>
      <p>If you can see this text, the component is rendering.</p>
      <p>User ID: {user?.id || 'No user'}</p>
      <p>User Email: {user?.email || 'No email'}</p>
      <div style={{ 
        backgroundColor: 'blue', 
        color: 'white', 
        padding: '20px', 
        marginTop: '20px',
        borderRadius: '8px'
      }}>
        This is a blue test box to confirm styling works
      </div>
    </div>
  );
};

export default CreateCampaign;