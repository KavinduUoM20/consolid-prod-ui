import { Fragment } from 'react';
import {
  Toolbar,
  ToolbarActions,
  ToolbarDescription,
  ToolbarHeading,
  ToolbarPageTitle,
} from '@/partials/common/toolbar';
import { WalletCards } from 'lucide-react';
import { Link } from 'react-router';
import { Button } from '@/components/ui/button';
import { Container } from '@/components/common/container';
import { ProcessExtractionContent } from '.';
import { Steps } from '../steps';

export function ProcessExtractionPage() {
  return (
    <Fragment>
      <Steps currentStep={2} />
      <Container>
        <Toolbar>
          <ToolbarHeading>
            <ToolbarPageTitle />
            <ToolbarDescription>Process document extraction with AI</ToolbarDescription>
          </ToolbarHeading>
          <ToolbarActions>
            <Button variant="outline">
              <WalletCards />
              <Link to="#">View History</Link>
            </Button>
          </ToolbarActions>
        </Toolbar>
      </Container>
      <Container>
        <ProcessExtractionContent />
      </Container>
    </Fragment>
  );
}
