{
  /*
    Chadson v69.69
    File: src/components/DownloadableSnowflake.tsx
    Purpose: Creates a downloadable link for the snowflake SVG.
    Project: SUBFROST Documentation
    Date: 2025-08-04
  */
}
import React from 'react';
import SnowflakeIcon from '@site/src/components/SnowflakeIcon';
import SnowflakeSvg from '@site/static/img/logo.svg';

const DownloadableSnowflake = () => {
  return (
    <a href={SnowflakeSvg} download="frost-logo.svg">
      <SnowflakeIcon style={{ width: '29px', height: '29px' }} />
    </a>
  );
};

export default DownloadableSnowflake;