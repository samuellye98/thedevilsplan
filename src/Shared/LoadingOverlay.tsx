import React from 'react';
import { Box, LoadingOverlay as MantineLoadingOverlay } from '@mantine/core';

type Props = {
  visible: boolean;
};

export const LoadingOverlay = ({ visible }: Props) => {
  return (
    <Box pos="relative">
      <MantineLoadingOverlay
        visible={visible}
        zIndex={1000}
        overlayProps={{ radius: 'sm', blur: 2 }}
        loaderProps={{ color: 'cyan', type: 'bars' }}
      />
    </Box>
  );
};
