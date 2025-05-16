

import React from 'react';
import Header from './Header';

const Layout = ({ children }) => {
  return (
    <>
      <Header />
      <div style={{ paddingTop: '72px' }}>
        {children}
      </div>
    </>
  );
};

export default Layout;