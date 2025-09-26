import { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Outlet, useLocation } from 'react-router-dom';
import { MENU_SIDEBAR } from '@/config/menu.config';
import { useBodyClass } from '@/hooks/use-body-class';
import { useMenu } from '@/hooks/use-menu';
import { useIsMobile } from '@/hooks/use-mobile';
import { useSettings } from '@/providers/settings-provider';
import { Footer } from './components/footer';
import { Header } from './components/header';
import { Sidebar } from './components/sidebar';

export function OnemasLayout() {
  const { pathname } = useLocation();
  const { getCurrentItem } = useMenu(pathname);
  const item = getCurrentItem(MENU_SIDEBAR);
  const { setOption } = useSettings();
  const isMobileMode = useIsMobile();

  useBodyClass(`
    [--header-height:58px] 
    [--sidebar-width:58px] 
    lg:overflow-hidden 
    bg-muted!
  `);

  useEffect(() => {
    setOption('layout', 'onemas');
    setOption('container', 'fluid');
  }, [setOption]);

  return (
    <>
      <Helmet>
        <title>{item?.title || 'Onemas Chat'}</title>
      </Helmet>
      <div className="flex grow">
        <Header />

        <div className="flex flex-col lg:flex-row grow pt-(--header-height)">
          {!isMobileMode && <Sidebar />}

          {/* Main content area with proper rounded corners - no navbar */}
          <div className="flex flex-col grow rounded-xl bg-background border border-border mx-5 lg:ms-(--sidebar-width) mb-5 overflow-hidden">
            <main className="grow flex flex-col h-full overflow-hidden" role="content">
              <Outlet />
            </main>
            {/* Fixed footer at bottom */}
            <Footer />
          </div>
        </div>
      </div>
    </>
  );
}
