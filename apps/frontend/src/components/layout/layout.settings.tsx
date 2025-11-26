'use client';

import { ReactNode, useCallback } from 'react';
import { ContextWrapper } from '@gitroom/frontend/components/layout/user.context';
import { TopMenu } from '@gitroom/frontend/components/layout/top.menu';
import { MantineWrapper } from '@gitroom/react/helpers/mantine.wrapper';
import { ToolTip } from '@gitroom/frontend/components/layout/top.tip';
import { ShowMediaBoxModal } from '@gitroom/frontend/components/media/media.component';
import Image from 'next/image';
import { Toaster } from '@gitroom/react/toaster/toaster';
import { ShowPostSelector } from '@gitroom/frontend/components/post-url-selector/post.url.selector';
import { OrganizationSelector } from '@gitroom/frontend/components/layout/organization.selector';
import NotificationComponent from '@gitroom/frontend/components/notifications/notification.component';
import Link from 'next/link';
import useSWR from 'swr';
import { useFetch } from '@gitroom/helpers/utils/custom.fetch';
import utc from 'dayjs/plugin/utc';
import weekOfYear from 'dayjs/plugin/weekOfYear';
import isoWeek from 'dayjs/plugin/isoWeek';
import isBetween from 'dayjs/plugin/isBetween';
import { ShowLinkedinCompany } from '@gitroom/frontend/components/launches/helpers/linkedin.component';
import { SettingsComponent } from '@gitroom/frontend/components/layout/settings.component';
import { ContinueProvider } from '@gitroom/frontend/components/layout/continue.provider';
import { CopilotKit } from '@copilotkit/react-core';
import { Impersonate } from '@gitroom/frontend/components/layout/impersonate';
import { BillingComponent } from '@gitroom/frontend/components/billing/billing.component';
import dynamic from 'next/dynamic';
import { NewSubscription } from '@gitroom/frontend/components/layout/new.subscription';
import { useVariables } from '@gitroom/react/helpers/variable.context';
import { extend } from 'dayjs';
import { useSearchParams } from 'next/navigation';
import { CheckPayment } from '@gitroom/frontend/components/layout/check.payment';
import { ChromeExtensionComponent } from '@gitroom/frontend/components/layout/chrome.extension.component';
import { LanguageComponent } from '@gitroom/frontend/components/layout/language.component';
import { MediaSettingsLayout } from '@gitroom/frontend/components/launches/helpers/media.settings.component';

const ModeComponent = dynamic(
  () => import('@gitroom/frontend/components/layout/mode.component'),
  { ssr: false }
);

extend(utc);
extend(weekOfYear);
extend(isoWeek);
extend(isBetween);

export const LayoutSettings = ({ children }: { children: ReactNode }) => {
  const fetch = useFetch();
  const { isGeneral, backendUrl, billingEnabled } = useVariables();
  const searchParams = useSearchParams();

  const load = useCallback(async (path: string) => {
    return await (await fetch(path)).json();
  }, []);

  const { data: user, mutate } = useSWR('/user/self', load, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    revalidateIfStale: false,
    refreshWhenOffline: false,
    refreshWhenHidden: false,
  });

  if (!user) return null;

  return (
    <ContextWrapper user={user}>
      <CopilotKit
        credentials="include"
        runtimeUrl={backendUrl + '/copilot/chat'}
        showDevConsole={false}
      >
        <MantineWrapper>
          {user.tier === 'FREE' && searchParams.get('check') && (
            <CheckPayment check={searchParams.get('check')!} mutate={mutate} />
          )}
          <ToolTip />
          <ShowMediaBoxModal />
          <ShowLinkedinCompany />
          <MediaSettingsLayout />
          <Toaster />
          <ShowPostSelector />
          <NewSubscription />
          <ContinueProvider />
          <div className="min-h-[100vh] w-full max-w-[1440px] mx-auto bg-primary px-6 text-textColor flex flex-col">
            {user?.admin && <Impersonate />}
            <nav className="flex items-center justify-between">
              <Link
                href="/"
                className="flex items-center gap-[10px] text-textColor order-1"
              >
                {/* اللوجو القديم */}
                <div className="min-w-[55px]">
                  <Image
                    src="/postiz.svg"
                    width={55}
                    height={53}
                    alt="Old Logo"
                  />
                </div>

                {/* اللوجو الجديد */}
                <div className="min-w-[55px]">
                  <Image
                    src="/postiz-text.svg"
                    width={55}
                    height={53}
                    alt="New Logo"
                  />
                </div>
              </Link>

              {user?.orgId &&
              (user.tier !== 'FREE' || !isGeneral || !billingEnabled) ? (
                <TopMenu />
              ) : null}

              <div
                id="systray-buttons"
                className="flex items-center justify-self-end gap-[8px] order-2 md:order-3"
              >
                <LanguageComponent />
                <ChromeExtensionComponent />
                <ModeComponent />
                <SettingsComponent />
                <NotificationComponent />
                <OrganizationSelector />
              </div>
            </nav>

            <div className="flex-1 flex">
              <div className="flex-1 rounded-3xl px-0 py-[17px] flex flex-col">
                {user.tier === 'FREE' && isGeneral && billingEnabled ? (
                  <BillingComponent />
                ) : (
                  <div className="flex flex-1 flex-col">{children}</div>
                )}
              </div>
            </div>
          </div>
        </MantineWrapper>
      </CopilotKit>
    </ContextWrapper>
  );
};
