import React from 'react';
import { Flex } from '@mantine/core';

export const PageCentered = ({ children }: { children: React.ReactNode }) => {
  return (
    <Flex
      style={{
        position: 'absolute',
        height: '100vh',
        width: '100vw',
      }}
      justify="center"
      align="center"
      direction="column"
      gap="md"
    >
      {children}
    </Flex>
  );
};
