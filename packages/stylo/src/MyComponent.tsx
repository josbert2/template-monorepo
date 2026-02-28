import React, { useState } from 'react';

interface MyComponentProps {
  initialCount?: number;
  message?: string;
}

const MyComponent: React.FC<MyComponentProps> = ({ initialCount = 0, message = 'You clicked' }) => {
  const [count, setCount] = useState(initialCount);

  return (
    <div style={{ padding: '20px', border: '1px solid #ccc', borderRadius: '8px' }}>
      <h2>My Awesome React Component</h2>
      <p>{message}: {count} times</p>
      <button
        onClick={() => setCount(prevCount => prevCount + 1)}
        style={{
          padding: '10px 15px',
          backgroundColor: '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
        }}
      >
        Increment
      </button>
    </div>
  );
};

export default MyComponent;