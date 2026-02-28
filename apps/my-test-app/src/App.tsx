import React from 'react';
import { MyComponent } from 'my-react-component'; // Importa tu componente

function App() {
  return (
    <div style={{ fontFamily: 'sans-serif', textAlign: 'center', marginTop: '50px' }}>
      <h1>My Test Application</h1>
      <MyComponent message="Welcome!" initialCount={5} />
      <p style={{ marginTop: '20px' }}>
        This is my custom React component from an NPM package!
      </p>
    </div>
  );
}

export default App;