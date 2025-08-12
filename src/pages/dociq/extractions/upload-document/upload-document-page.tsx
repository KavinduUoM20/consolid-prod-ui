import { Fragment, useState } from 'react';
import {
  Toolbar,
  ToolbarActions,
  ToolbarDescription,
  ToolbarHeading,
  ToolbarPageTitle,
} from '@/partials/common/toolbar';
import { ChevronDown, Building2, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Container } from '@/components/common/container';
import { UploadDocumentContent } from '.';
import { Steps } from '../steps';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export function UploadDocumentPage() {
  const [selectedCluster, setSelectedCluster] = useState<string>('');
  const [selectedCustomer, setSelectedCustomer] = useState<string>('');

  const clusters = ['LINEA AQUA', 'ACTIVE', 'LINEA INTOMO', 'BODYLINE', 'KREEDA'];
  const customers = ['Abercrombie & Fitch', 'Adore Me', 'Alo Yoga', 'Amante', 'Anta', 'MAS Innovation', 'Nike', 'Patagonia'];

  return (
    <Fragment>
      <Steps currentStep={0} />
      <Container>
        <Toolbar>
          <ToolbarHeading>
            <ToolbarPageTitle />
            <ToolbarDescription>
              Review your items before checkout
            </ToolbarDescription>
          </ToolbarHeading>
          <ToolbarActions>
            {/* Cluster Selection Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="outline" 
                  className="min-w-[160px] justify-between bg-background hover:bg-accent"
                >
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                    <span className={selectedCluster ? 'text-foreground' : 'text-muted-foreground'}>
                      {selectedCluster || 'Select Cluster'}
                    </span>
                  </div>
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-[200px]">
                {clusters.map((cluster) => (
                  <DropdownMenuItem 
                    key={cluster}
                    onClick={() => setSelectedCluster(cluster)}
                    className="cursor-pointer hover:bg-accent"
                  >
                    {cluster}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Customer Selection Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="outline" 
                  className="min-w-[180px] justify-between bg-background hover:bg-accent"
                >
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span className={selectedCustomer ? 'text-foreground' : 'text-muted-foreground'}>
                      {selectedCustomer || 'Select Customer'}
                    </span>
                  </div>
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-[220px]">
                {customers.map((customer) => (
                  <DropdownMenuItem 
                    key={customer}
                    onClick={() => setSelectedCustomer(customer)}
                    className="cursor-pointer hover:bg-accent"
                  >
                    {customer}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </ToolbarActions>
        </Toolbar>
      </Container>
      <Container>
        <UploadDocumentContent 
          selectedCluster={selectedCluster}
          selectedCustomer={selectedCustomer}
        />
      </Container>
    </Fragment>
  );
}
