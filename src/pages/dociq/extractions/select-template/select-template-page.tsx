import { Fragment } from 'react';
import {
  Toolbar,
  ToolbarActions,
  ToolbarDescription,
  ToolbarHeading,
  ToolbarPageTitle,
} from '@/partials/common/toolbar';
import { FileText } from 'lucide-react';
import { Link } from 'react-router';
import { Button } from '@/components/ui/button';
import { Container } from '@/components/common/container';
import { SelectTemplateContent } from '.';
import { Steps } from '../steps';

export function SelectTemplatePage() {
  return (
    <Fragment>
      <Steps currentStep={1} />
      <Container>
        <Toolbar>
          <ToolbarHeading>
            <ToolbarPageTitle />
            <ToolbarDescription>
              Select a template for document extraction
            </ToolbarDescription>
          </ToolbarHeading>
          <ToolbarActions>
            <Button variant="outline">
              <FileText />
              <Link to="#">Create Template</Link>
            </Button>
          </ToolbarActions>
        </Toolbar>
      </Container>
      <Container>
        <SelectTemplateContent />
      </Container>
    </Fragment>
  );
} 