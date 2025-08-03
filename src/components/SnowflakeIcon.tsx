{
  /*
    Chadson v69.69
    File: src/components/SnowflakeIcon.tsx
    Purpose: Renders the snowflake SVG icon.
    Project: SUBFROST Documentation
    Date: 2025-08-03
    Task: Decrease the size of the snowflake icon by 20%.
  */
}
import React from 'react';

import Snowflake from '@site/src/components/snowflake_light_center.svg';

const SnowflakeIcon = (props) => (
  <Snowflake {...props} />
);

export default SnowflakeIcon;