import React from 'react';

class DualScrollbar extends React.Component {
  render() {
    return (
      <div style={{ display: 'flex', width: '100%', height: '100vh' }}>
        <div style={{ flex: '1', overflowX: 'scroll' }}>
          <div style={{ minWidth: '300px', width: '100%', height: '100%', whiteSpace: 'nowrap' }}>
            {[...Array(24).keys()].map(hour => (
              <div key={hour} style={{ width: '50px', display: 'inline-block' }}>{hour}:00</div>
            ))}
          </div>
        </div>
        <div style={{ flex: '1', overflowX: 'scroll' }}>
          <div style={{ width: '100%', height: '100%', whiteSpace: 'nowrap' }}>
            {Array.from({ length: 10 }, (_, index) => (
              <div key={index} style={{ minWidth: '200px', width: 'auto', display: 'inline-block', margin: '0 5px' }}>
                File {index + 1}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }
}

export default DualScrollbar;
