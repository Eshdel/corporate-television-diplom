import React, { useState } from 'react';

const ScrollableContent = () => {
  const [scrollPosition, setScrollPosition] = useState(0);

  const handleScroll = (event) => {
    const { scrollTop, scrollHeight, clientHeight } = event.target;
    const maxScrollTop = scrollHeight - clientHeight;
    const percentage = (scrollTop / maxScrollTop) * 100;
    setScrollPosition(percentage);
  };

  const handleScrollbarScroll = (percentage) => {
    const { scrollHeight, clientHeight } = document.getElementById('content');
    const maxScrollTop = scrollHeight - clientHeight;
    const scrollTop = (percentage / 100) * maxScrollTop;
    document.getElementById('content').scrollTop = scrollTop;
    setScrollPosition(percentage);
  };

  return (
    <div style={{ display: 'flex' }}>
      <div
        id="content"
        style={{ flex: 1, overflowY: 'scroll' }}
        onScroll={handleScroll}
      >
        {/* Здесь ваш контент */}
      </div>
      <div
        style={{
          width: '10px',
          marginLeft: '5px',
          backgroundColor: '#ccc',
          borderRadius: '5px',
        }}
      >
        <div
          style={{
            width: '100%',
            height: '100%',
            backgroundColor: '#999',
            borderRadius: '5px',
            position: 'relative',
            top: `${scrollPosition}%`,
          }}
        />
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            cursor: 'pointer',
          }}
          onClick={(e) =>
            handleScrollbarScroll(
              (e.nativeEvent.offsetY / e.target.clientHeight) * 100
            )
          }
        />
      </div>
    </div>
  );
};

export default ScrollableContent;
