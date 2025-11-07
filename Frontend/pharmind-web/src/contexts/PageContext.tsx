import React, { createContext, useContext, useState, useCallback, useMemo, ReactNode } from 'react';

interface PageContextType {
  pageTitle: string;
  pageIcon: string;
  pageColor?: string;
  toolbarContent: ReactNode | null;
  toolbarCenterContent: ReactNode | null;
  toolbarRightContent: ReactNode | null;
  showFiltersButton: boolean;
  activeFiltersCount: number;
  onFiltersClick?: () => void;
  setPageInfo: (title: string, icon: string, color?: string) => void;
  setToolbarContent: (content: ReactNode | null) => void;
  setToolbarCenterContent: (content: ReactNode | null) => void;
  setToolbarRightContent: (content: ReactNode | null) => void;
  setFiltersButton: (show: boolean, count: number, onClick?: () => void) => void;
  clearToolbarContent: () => void;
}

const PageContext = createContext<PageContextType | undefined>(undefined);

export const PageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [pageTitle, setPageTitle] = useState('');
  const [pageIcon, setPageIcon] = useState('');
  const [pageColor, setPageColor] = useState<string | undefined>(undefined);
  const [toolbarContent, setToolbarContentState] = useState<ReactNode | null>(null);
  const [toolbarCenterContent, setToolbarCenterContentState] = useState<ReactNode | null>(null);
  const [toolbarRightContent, setToolbarRightContentState] = useState<ReactNode | null>(null);
  const [showFiltersButton, setShowFiltersButton] = useState(false);
  const [activeFiltersCount, setActiveFiltersCount] = useState(0);
  const [onFiltersClick, setOnFiltersClick] = useState<(() => void) | undefined>(undefined);

  const setPageInfo = useCallback((title: string, icon: string, color?: string) => {
    setPageTitle(title);
    setPageIcon(icon);
    setPageColor(color);
  }, []);

  const setToolbarContent = useCallback((content: ReactNode | null) => {
    setToolbarContentState(content);
  }, []);

  const setToolbarCenterContent = useCallback((content: ReactNode | null) => {
    setToolbarCenterContentState(content);
  }, []);

  const setToolbarRightContent = useCallback((content: ReactNode | null) => {
    setToolbarRightContentState(content);
  }, []);

  const setFiltersButton = useCallback((show: boolean, count: number, onClick?: () => void) => {
    setShowFiltersButton(show);
    setActiveFiltersCount(count);
    setOnFiltersClick(() => onClick);
  }, []);

  const clearToolbarContent = useCallback(() => {
    setToolbarContentState(null);
    setToolbarCenterContentState(null);
    setToolbarRightContentState(null);
    setPageTitle('');
    setPageIcon('');
    setPageColor(undefined);
    setShowFiltersButton(false);
    setActiveFiltersCount(0);
    setOnFiltersClick(undefined);
  }, []);

  const contextValue = useMemo(
    () => ({
      pageTitle,
      pageIcon,
      pageColor,
      toolbarContent,
      toolbarCenterContent,
      toolbarRightContent,
      showFiltersButton,
      activeFiltersCount,
      onFiltersClick,
      setPageInfo,
      setToolbarContent,
      setToolbarCenterContent,
      setToolbarRightContent,
      setFiltersButton,
      clearToolbarContent,
    }),
    [
      pageTitle,
      pageIcon,
      pageColor,
      toolbarContent,
      toolbarCenterContent,
      toolbarRightContent,
      showFiltersButton,
      activeFiltersCount,
      onFiltersClick,
      setPageInfo,
      setToolbarContent,
      setToolbarCenterContent,
      setToolbarRightContent,
      setFiltersButton,
      clearToolbarContent,
    ]
  );

  return (
    <PageContext.Provider value={contextValue}>
      {children}
    </PageContext.Provider>
  );
};

export const usePage = () => {
  const context = useContext(PageContext);
  if (!context) {
    throw new Error('usePage must be used within PageProvider');
  }
  return context;
};
