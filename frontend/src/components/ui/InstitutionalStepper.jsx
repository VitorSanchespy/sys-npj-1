import { Stepper } from '@mantine/core';

export default function InstitutionalStepper({ children, ...props }) {
  return (
    <Stepper
      color="#003366"
      iconSize={32}
      size="md"
      styles={{
        stepBody: { fontFamily: 'Georgia, serif' },
        stepIcon: { borderColor: '#003366', background: '#fff' },
        stepCompletedIcon: { background: '#ffd700', borderColor: '#003366', color: '#003366' }
      }}
      {...props}
    >
      {children}
    </Stepper>
  );
}