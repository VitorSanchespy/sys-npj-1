import React from 'react';
import { Text as MantineText } from '@mantine/core';

const SafeText = ({ children, ...props }) => {
  return <MantineText {...props}>{children}</MantineText>;
};

export default SafeText;