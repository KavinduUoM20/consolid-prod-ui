import { Fragment } from 'react';
import { Container } from '@/components/common/container';
import { MyOrdersContent } from '.';

export function MyOrdersPage() {
  return (
    <Fragment>
      <Container>     
        <MyOrdersContent />
      </Container>
    </Fragment>
  );
}
