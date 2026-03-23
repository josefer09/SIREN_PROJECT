export interface User {
  id: string;
  email: string;
  fullName: string;
  roles: string[];
}

export interface LoginResponse {
  user: User;
  token: string;
}

export interface Project {
  id: string;
  name: string;
  description: string | null;
  baseUrl: string;
  projectPath: string | null;
  directoryStrategy: DirectoryStrategy;
  createdAt: string;
  updatedAt: string;
}

export interface Page {
  id: string;
  name: string;
  path: string;
  description: string | null;
  project?: { id: string; baseUrl: string; name: string };
  createdAt: string;
  updatedAt: string;
}

export interface Selector {
  id: string;
  name: string;
  elementType: ElementType;
  selectorStrategy: SelectorStrategy | null;
  selectorValue: string | null;
  status: SelectorStatus;
  description: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProjectPayload {
  name: string;
  description?: string;
  baseUrl: string;
  projectPath?: string;
  directoryStrategy?: DirectoryStrategy;
}

export interface UpdateProjectPayload {
  name?: string;
  description?: string;
  baseUrl?: string;
  projectPath?: string;
  directoryStrategy?: DirectoryStrategy;
}

export interface CreatePagePayload {
  name: string;
  path: string;
  description?: string;
  projectId: string;
}

export interface UpdatePagePayload {
  name?: string;
  path?: string;
  description?: string;
}

export interface CreateSelectorPayload {
  name: string;
  elementType: ElementType;
  selectorStrategy?: SelectorStrategy;
  selectorValue?: string;
  description?: string;
  pageId: string;
}

export interface UpdateSelectorPayload {
  name?: string;
  elementType?: ElementType;
  selectorStrategy?: SelectorStrategy;
  selectorValue?: string;
  description?: string;
  status?: SelectorStatus;
}

export interface SetSelectorValuePayload {
  selectorStrategy: SelectorStrategy;
  selectorValue: string;
}

export interface PageExport {
  pageName: string;
  baseUrl: string;
  selectors: Record<string, { strategy: string; value: string; elementType: string }>;
}

export enum DirectoryStrategy {
  FLAT = 'flat',
  FEATURE_BASED = 'feature_based',
}

export enum ElementType {
  INPUT = 'input',
  BUTTON = 'button',
  SELECT = 'select',
  TEXTAREA = 'textarea',
  LABEL = 'label',
  LINK = 'link',
  DIV = 'div',
  SPAN = 'span',
  CHECKBOX = 'checkbox',
  RADIO = 'radio',
  TABLE = 'table',
  IMAGE = 'image',
  HEADING = 'heading',
  OTHER = 'other',
}

export enum SelectorStrategy {
  ID = 'id',
  CLASS = 'class',
  CSS = 'css',
  XPATH = 'xpath',
  DATA_CY = 'data-cy',
  DATA_TESTID = 'data-testid',
  PLACEHOLDER = 'placeholder',
  NAME = 'name',
  TAG = 'tag',
}

export enum SelectorStatus {
  PENDING = 'pending',
  MAPPED = 'mapped',
  DEPRECATED = 'deprecated',
}

export interface InspectorSelectorOption {
  strategy: string;
  value: string;
  display: string;
}

export interface InspectorElementMessage {
  type: 'SIREN_ELEMENT_SELECTED';
  elementType: string;
  selectors: InspectorSelectorOption[];
  tagName: string;
  text: string;
}
