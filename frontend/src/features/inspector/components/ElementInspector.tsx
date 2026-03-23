import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  ArrowLeft,
  Check,
  Crosshair,
  MousePointer,
  X,
} from 'lucide-react';

import { pageApi } from '@/features/page/page.api';
import { selectorApi } from '@/features/selector/selector.api';
import { useSetSelectorValue } from '@/features/selector/hooks/useSetSelectorValue';
import { useAuthStore } from '@/store/auth.store';
import type { InspectorSelectorOption, SelectorStrategy } from '@/types';

export const ElementInspector = () => {
  const { id: pageId, selectorId } = useParams<{ id: string; selectorId: string }>();
  const navigate = useNavigate();
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const [inspectMode, setInspectMode] = useState(false);
  const [selectorOptions, setSelectorOptions] = useState<InspectorSelectorOption[]>([]);
  const [selectedOption, setSelectedOption] = useState<InspectorSelectorOption | null>(null);
  const [elementInfo, setElementInfo] = useState<{
    tagName: string;
    text: string;
    elementType: string;
  } | null>(null);

  const pageQuery = useQuery({
    queryKey: ['page', pageId],
    queryFn: () => pageApi.getOne(pageId!),
    enabled: !!pageId,
  });

  const selectorQuery = useQuery({
    queryKey: ['selector', selectorId],
    queryFn: () => selectorApi.getOne(selectorId!),
    enabled: !!selectorId,
  });

  const { setValueMutation } = useSetSelectorValue();

  // Build proxy URL for iframe
  const pageData = pageQuery.data;
  const baseUrl = pageData?.project?.baseUrl || '';
  const pagePath = pageData?.path || '/';
  const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:3001/api/v1';
  const token = useAuthStore((s) => s.token);
  const proxyUrl = baseUrl
    ? `${apiBase}/proxy/site?target=${encodeURIComponent(baseUrl)}&path=${encodeURIComponent(pagePath)}&token=${encodeURIComponent(token || '')}`
    : '';

  // Listen for messages from iframe inspector script
  const handleMessage = useCallback(
    (event: MessageEvent) => {
      if (event.data?.type === 'SIREN_ELEMENT_SELECTED') {
        setSelectorOptions(event.data.selectors || []);
        setElementInfo({
          tagName: event.data.tagName,
          text: event.data.text,
          elementType: event.data.elementType,
        });
        setSelectedOption(null);
        setInspectMode(false);
        toggleInspectInIframe(false);
      }
    },
    [],
  );

  useEffect(() => {
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [handleMessage]);

  const toggleInspectInIframe = (enabled: boolean) => {
    iframeRef.current?.contentWindow?.postMessage(
      { type: 'SIREN_TOGGLE_INSPECT', enabled },
      '*',
    );
  };

  const handleToggleInspect = () => {
    const next = !inspectMode;
    setInspectMode(next);
    toggleInspectInIframe(next);
  };

  const handleSave = () => {
    if (!selectedOption || !selectorId) return;

    setValueMutation.mutate(
      {
        id: selectorId,
        payload: {
          selectorStrategy: selectedOption.strategy as SelectorStrategy,
          selectorValue: selectedOption.value,
        },
      },
      {
        onSuccess: () => navigate(`/pages/${pageId}`, { replace: true }),
      },
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-bg">
      {/* Toolbar */}
      <div className="flex items-center gap-3 px-4 py-3 bg-card border-b border-border shrink-0">
        <button
          onClick={() => navigate(`/pages/${pageId}`, { replace: true })}
          className="p-2 rounded-lg hover:bg-bg-secondary transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        <div className="flex-1">
          <p className="text-sm font-medium">
            Inspector — <span className="font-mono text-primary">{selectorQuery.data?.name}</span>
          </p>
          <p className="text-xs text-text-muted">{baseUrl}{pagePath}</p>
        </div>

        <button
          onClick={handleToggleInspect}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
            inspectMode
              ? 'bg-primary text-white'
              : 'btn-secondary'
          }`}
        >
          {inspectMode ? (
            <>
              <Crosshair className="w-4 h-4 animate-pulse" />
              Click an element...
            </>
          ) : (
            <>
              <MousePointer className="w-4 h-4" />
              Get Selector
            </>
          )}
        </button>
      </div>

      {/* Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Iframe */}
        <div className="flex-1 relative">
          {proxyUrl ? (
            <iframe
              ref={iframeRef}
              src={proxyUrl}
              className="w-full h-full border-none"
              sandbox="allow-scripts allow-same-origin allow-forms"
            />
          ) : (
            <div className="flex items-center justify-center h-full text-text-muted">
              Loading page...
            </div>
          )}
        </div>

        {/* Right panel — selector options */}
        <div className="w-80 bg-card border-l border-border overflow-y-auto p-4">
          <h3 className="text-sm font-semibold mb-3">Selector Options</h3>

          {!elementInfo && (
            <p className="text-sm text-text-muted">
              Click "Get Selector" then click an element on the page to see available selectors.
            </p>
          )}

          {elementInfo && (
            <div className="mb-4 p-3 bg-bg-secondary rounded-lg">
              <p className="text-xs text-text-muted">Element</p>
              <p className="text-sm font-mono font-medium">
                &lt;{elementInfo.tagName}&gt;
              </p>
              {elementInfo.text && (
                <p className="text-xs text-text-secondary mt-1 truncate">
                  {elementInfo.text}
                </p>
              )}
              <p className="text-xs text-text-muted mt-1">
                Type: {elementInfo.elementType}
              </p>
            </div>
          )}

          {selectorOptions.length > 0 && (
            <div className="space-y-2">
              {selectorOptions.map((opt, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedOption(opt)}
                  className={`w-full text-left p-3 rounded-lg border transition-colors text-sm ${
                    selectedOption === opt
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:bg-bg-secondary'
                  }`}
                >
                  <p className="text-xs text-text-muted mb-1">{opt.strategy}</p>
                  <p className="font-mono text-xs break-all">{opt.value}</p>
                </button>
              ))}
            </div>
          )}

          {selectedOption && (
            <div className="mt-4 space-y-2">
              <div className="p-3 bg-accent/5 border border-accent/20 rounded-lg">
                <p className="text-xs text-text-muted">Selected</p>
                <p className="text-sm font-mono font-medium text-accent">
                  {selectedOption.value}
                </p>
              </div>

              <button
                onClick={handleSave}
                className="btn-accent w-full flex items-center justify-center gap-2"
                disabled={setValueMutation.isPending}
              >
                <Check className="w-4 h-4" />
                {setValueMutation.isPending ? 'Saving...' : 'Save Selector'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
