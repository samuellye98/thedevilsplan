import React from 'react';
import { Loader, Flex } from '@mantine/core';

export const LoadingState = () => {
  return (
    <Flex
      style={{
        position: 'absolute',
        height: '100vh',
        width: '100vw',
      }}
      justify="center"
      align="center"
    >
      <Loader color="cyan" type="bars" />
    </Flex>
  );
};
