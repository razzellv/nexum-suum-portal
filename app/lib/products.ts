// Nexum Suum — Product & Stripe Price Registry
// All priceId values are live Stripe price IDs.
// Products are separated by package type.

export type ProductKey =
  | 'boiler_intelligence'
  | 'boiler_intelligence_looker'
  | 'chiller_intelligence'
  | 'chiller_intelligence_looker'
  | 'facility_intelligence'
  | 'facility_intelligence_advanced'
  | 'facility_compliance_guide'
  | 'thermodynamics_maintenance'
  | 'document_checklist_only'
  | 'document_sops_only';

export type ProductCategory = 'boiler' | 'chiller' | 'facility' | 'document';

export interface LibraryDocument {
  label: string;
  /** Path relative to /public/library/ */
  file: string;
  type: 'pdf' | 'docx' | 'xlsx';
}

export interface Product {
  key: ProductKey;
  name: string;
  description: string;
  priceId: string;
  price: number;           // display price in USD — set when known
  billing: 'one-time' | 'monthly' | 'annual';
  category: ProductCategory;
  includes: string[];
  documents: LibraryDocument[];
  /** Looker Studio embed URL — set when dashboard is published */
  lookerEmbedUrl?: string;
  /** Google Sheet ID for data entry — set when sheet is available */
  dataEntrySheet?: string;
  /** Cross-reference: also used by FIAS / Doc Gen in nexum-unified-gateway */
  fiasDocGenKey?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// BOILER INTELLIGENCE PACKAGE
// ─────────────────────────────────────────────────────────────────────────────

const BOILER_DOCS: LibraryDocument[] = [
  // Guide
  { label: 'Boiler Optimization Guide',   file: 'boiler/guide/Boiler Opt. Guide (1)-1.pdf', type: 'pdf' },
  { label: 'Boiler Description',           file: 'boiler/guide/NS-BLR-PRM_DESCRIPTION.pdf',  type: 'pdf' },
  { label: 'Combustion Guide',             file: 'boiler/guide/NS-BLR-PRM-COMB.pdf',          type: 'pdf' },
  { label: 'Combustion Readout',           file: 'boiler/guide/NS-BLR-PRM-COMREA.pdf',        type: 'pdf' },
  { label: 'Condensate Systems',           file: 'boiler/guide/NS-BLR-PRM-COND002.pdf',       type: 'pdf' },
  { label: 'Current Use Guide',            file: 'boiler/guide/NS-BLR-PRM-CUSE.pdf',          type: 'pdf' },
  { label: 'DA System Guide 1',            file: 'boiler/guide/NS-BLR-PRM-DA001.pdf',         type: 'pdf' },
  { label: 'DA System Guide 2',            file: 'boiler/guide/NS-BLR-PRM-DA002.pdf',         type: 'pdf' },
  { label: 'DA System Guide 3',            file: 'boiler/guide/NS-BLR-PRM-DA003.pdf',         type: 'pdf' },
  { label: 'Expansion & Dump Tank 1',      file: 'boiler/guide/NS-BLR-PRM-EXD001.pdf',        type: 'pdf' },
  { label: 'Expansion & Dump Tank 2',      file: 'boiler/guide/NS-BLR-PRM-EXD002.pdf',        type: 'pdf' },
  { label: 'Expansion & Dump Tank 3',      file: 'boiler/guide/NS-BLR-PRM-EXD003.pdf',        type: 'pdf' },
  { label: 'Feedwater System',             file: 'boiler/guide/NS-BLR-PRM-FW001.pdf',         type: 'pdf' },
  { label: 'Water Chemistry',              file: 'boiler/guide/NS-BLR-PRM-H20CHEM.pdf',       type: 'pdf' },
  { label: 'Heat Recovery Unit',           file: 'boiler/guide/NS-BLR-PRM-HRU001.pdf',        type: 'pdf' },
  { label: 'Operating Limits',             file: 'boiler/guide/NS-BLR-PRM-LIMITS001.pdf',     type: 'pdf' },
  { label: 'Makeup Water 1',               file: 'boiler/guide/NS-BLR-PRM-MKUP001.pdf',       type: 'pdf' },
  { label: 'Makeup Water 2',               file: 'boiler/guide/NS-BLR-PRM-MKUP002.pdf',       type: 'pdf' },
  { label: 'Makeup Water 3',               file: 'boiler/guide/NS-BLR-PRM-MKUP003.pdf',       type: 'pdf' },
  { label: 'Process Overview',             file: 'boiler/guide/NS-BLR-PRM-PROCESS.pdf',       type: 'pdf' },
  { label: 'PRV System',                   file: 'boiler/guide/NS-BLR-PRM-PRV001.pdf',        type: 'pdf' },
  { label: 'Risk Control',                 file: 'boiler/guide/NS-BLR-PRM-RISKCO.pdf',        type: 'pdf' },
  { label: 'Troubleshooting',              file: 'boiler/guide/NS-BLR-PRM-TBSH001.pdf',       type: 'pdf' },
  // Logs & Checklists
  { label: 'Checklist 2',                  file: 'boiler/logs/NS-BLR-PRM-CKLST002.pdf',       type: 'pdf' },
  { label: 'Checklist 3',                  file: 'boiler/logs/NS-BLR-PRM-CKLST003.pdf',       type: 'pdf' },
  { label: 'Checklist 4',                  file: 'boiler/logs/NS-BLR-PRM-CKLST004.pdf',       type: 'pdf' },
  { label: 'Log Sheet 1',                  file: 'boiler/logs/NS-BLR-PRM-LOG001.pdf',         type: 'pdf' },
  { label: 'Log Sheet 2',                  file: 'boiler/logs/NS-BLR-PRM-LOG002.pdf',         type: 'pdf' },
  { label: 'Log Sheet 3',                  file: 'boiler/logs/NS-BLR-PRM-LOG003.pdf',         type: 'pdf' },
  { label: 'Log Sheet 4',                  file: 'boiler/logs/NS-BLR-PRM-LOG004.pdf',         type: 'pdf' },
  { label: 'Log Sheet 5',                  file: 'boiler/logs/NS-BLR-PRM-LOG005.pdf',         type: 'pdf' },
  { label: 'Weekly Log',                   file: 'boiler/logs/NS-BLR-PRM-WEEKLY001.pdf',      type: 'pdf' },
  // Safety
  { label: 'Safety Module 1',              file: 'boiler/safety/NS-BLR-PRM-SAFE-001.pdf',     type: 'pdf' },
  { label: 'Safety Module 2',              file: 'boiler/safety/NS-BLR-PRM-SAFE-002.pdf',     type: 'pdf' },
  { label: 'Safety Module 3',              file: 'boiler/safety/NS-BLR-PRM-SAFE-003.pdf',     type: 'pdf' },
  { label: 'Safety Module 4',              file: 'boiler/safety/NS-BLR-PRM-SAFE-004.pdf',     type: 'pdf' },
  { label: 'Safety Module 5',              file: 'boiler/safety/NS-BLR-PRM-SAFE-005.pdf',     type: 'pdf' },
  { label: 'Safety Module 6',              file: 'boiler/safety/NS-BLR-PRM-SAFE-006.pdf',     type: 'pdf' },
  // Ops
  { label: 'Motorized Valve Procedure',    file: 'boiler/ops/NS-BLR-PRM-AMV001.pdf',          type: 'pdf' },
  { label: 'Blowdown Procedure',           file: 'boiler/ops/NS-BLR-PRM-BLWDWN001.pdf',       type: 'pdf' },
  { label: 'Blowdown Procedure (Word)',    file: 'boiler/ops/NS-BLR-PRM-BLWDWN001.docx',      type: 'docx' },
  { label: 'Condensate Return',            file: 'boiler/ops/NS-BLR-PRM-COND001.pdf',         type: 'pdf' },
  { label: 'DA Operations',               file: 'boiler/ops/NS-BLR-PRM-DA001.pdf',           type: 'pdf' },
  { label: 'Flame Safeguard',              file: 'boiler/ops/NS-BLR-PRM-FSGUARD001.pdf',      type: 'pdf' },
  { label: 'LWFCO Procedure',              file: 'boiler/ops/NS-BLR-PRM-LWFCO_001.pdf',       type: 'pdf' },
  { label: 'Purge Procedure',              file: 'boiler/ops/NS-BLR-PRM-PURP.pdf',            type: 'pdf' },
  // Extras
  { label: 'Looker Logger (Excel)',        file: 'boiler/NS-Boiler-Looker_Logger_001.xlsx',   type: 'xlsx' },
  { label: 'Boiler Guide (Word)',          file: 'boiler/Nexum_Suum_Boiler_Guide.docx',       type: 'docx' },
];

export const BOILER_INTELLIGENCE: Product = {
  key: 'boiler_intelligence',
  name: 'Boiler Intelligence Package',
  description: 'Complete boiler optimization system: SOPs, safety protocols, log sheets, performance guides, and operational procedures.',
  priceId: 'price_1SzoOpDfw4bOR2df35qzBQ9r',
  price: 0,
  billing: 'one-time',
  category: 'boiler',
  includes: [
    'Boiler Optimization Guide',
    'SOPs — Combustion, Makeup Water, Condensate, Feedwater',
    'Safety Checklists (6 modules)',
    'Daily & Weekly Log Sheets',
    'Operational Procedures (Blowdown, LWFCO, Condensate)',
    'Risk Control & Combustion Analysis',
    'Looker Logger (Excel)',
  ],
  documents: BOILER_DOCS,
};

export const BOILER_INTELLIGENCE_LOOKER: Product = {
  key: 'boiler_intelligence_looker',
  name: 'Boiler Intelligence Package + Looker Studio Analyzer',
  description: 'Everything in the Boiler Intelligence Package plus live Looker Studio dashboard for real-time data analysis.',
  priceId: 'price_1SzoS9Dfw4bOR2dfaWJ6UqkB',
  price: 0,
  billing: 'one-time',
  category: 'boiler',
  includes: [
    'Everything in Boiler Intelligence Package',
    'Looker Studio Dashboard (embedded)',
    'Live data analyzer integration',
  ],
  documents: BOILER_DOCS,
  lookerEmbedUrl:  '', // TODO: add Looker Studio embed URL when published
  dataEntrySheet:  '', // TODO: add Google Sheet ID when available
};

// ─────────────────────────────────────────────────────────────────────────────
// CHILLER INTELLIGENCE PACKAGE
// ─────────────────────────────────────────────────────────────────────────────

const CHILLER_DOCS: LibraryDocument[] = [
  // Guide
  { label: 'Chilled Water Pump Guide',    file: 'chiller/guide/NS-CHLLR-PRM-CHCP002.pdf',         type: 'pdf' },
  { label: 'Cooling Tower Guide 2',        file: 'chiller/guide/NS-CHLLR-PRM-CT002.pdf',            type: 'pdf' },
  { label: 'Cooling Tower Guide 3',        file: 'chiller/guide/NS-CHLLR-PRM-CT003.pdf',            type: 'pdf' },
  { label: 'Chiller Optimization Guide',   file: 'chiller/guide/NS-CHLLR-PRM-OPT002.pdf',           type: 'pdf' },
  { label: 'Refrigerant Reference',        file: 'chiller/guide/NS-CHLLR-PRM-REF001.pdf',           type: 'pdf' },
  // Logs & Checklists
  { label: 'Master Checklist',             file: 'chiller/logs/NS-CHLLR-PRM-CHECKLIST001.pdf',      type: 'pdf' },
  { label: 'Checklist Module 3',           file: 'chiller/logs/NS-CHLLR-PRM-CKLST003.pdf',          type: 'pdf' },
  { label: 'Cooling System Opt. Sheet',    file: 'chiller/logs/NS-CHLLR-PRM-CS_OPT002.pdf',         type: 'pdf' },
  { label: 'Cooling Tower Checklist',      file: 'chiller/logs/NS-CHLLR-PRM-CT_CKLST003.pdf',       type: 'pdf' },
  { label: 'Log Sheet 1',                  file: 'chiller/logs/NS-CHLLR-PRM-LOG001.pdf',             type: 'pdf' },
  { label: 'Log Sheet 2',                  file: 'chiller/logs/NS-CHLLR-PRM-LOG002.pdf',             type: 'pdf' },
  { label: 'Log Sheet 3',                  file: 'chiller/logs/NS-CHLLR-PRM-LOG003.pdf',             type: 'pdf' },
  // Extras
  { label: 'Looker Logger (Excel)',        file: 'chiller/NS-Chiller-Looker_Logger_001.xlsx',        type: 'xlsx' },
  { label: 'Chiller Intelligence (Word)',  file: 'chiller/Chiller Facility Intelligence.docx',       type: 'docx' },
];

export const CHILLER_INTELLIGENCE: Product = {
  key: 'chiller_intelligence',
  name: 'Chiller Intelligence Package',
  description: 'Complete chiller optimization system: guides, log sheets, checklists, cooling system procedures, and refrigeration references.',
  priceId: 'price_1SzoQ9Dfw4bOR2dfNsRjWHec',
  price: 0,
  billing: 'one-time',
  category: 'chiller',
  includes: [
    'Chiller Optimization Guide',
    'Cooling Tower Guides (CT002, CT003)',
    'Refrigerant Reference',
    'Chilled Water Pump Guide',
    'Log Sheets (3 modules)',
    'Checklists (Master + Module 3)',
    'Cooling System Optimization Sheet',
    'Cooling Tower Checklist',
    'Looker Logger (Excel)',
  ],
  documents: CHILLER_DOCS,
};

export const CHILLER_INTELLIGENCE_LOOKER: Product = {
  key: 'chiller_intelligence_looker',
  name: 'Chiller Intelligence Package + Looker Studio Analyzer',
  description: 'Everything in the Chiller Intelligence Package plus live Looker Studio dashboard integration.',
  priceId: 'price_1SzoSoDfw4bOR2dfTqTf3dJN',
  price: 0,
  billing: 'one-time',
  category: 'chiller',
  includes: [
    'Everything in Chiller Intelligence Package',
    'Looker Studio Dashboard (embedded)',
    'Live data analyzer integration',
  ],
  documents: CHILLER_DOCS,
  lookerEmbedUrl:  '', // TODO: add Looker Studio embed URL when published
  dataEntrySheet:  '', // TODO: add Google Sheet ID when available
};

// ─────────────────────────────────────────────────────────────────────────────
// FACILITY INTELLIGENCE PACKAGE
// ─────────────────────────────────────────────────────────────────────────────

const FACILITY_DOCS: LibraryDocument[] = [
  // SOPs
  { label: 'Boiler SOP',                        file: 'facility/sops/Nexum_Suum_Boiler_SOP.docx',                                       type: 'docx' },
  { label: 'Chiller SOP',                        file: 'facility/sops/Nexum_Suum_Chiller_SOP.docx',                                      type: 'docx' },
  { label: 'Pump Systems SOP',                   file: 'facility/sops/Nexum_Suum_Pump_Systems_SOP.docx',                                  type: 'docx' },
  { label: 'AHU & Ventilation SOP',              file: 'facility/sops/Nexum_Suum_AHU_and_Ventilation_Systems_SOP.docx',                   type: 'docx' },
  { label: 'Cooling Tower SOP',                  file: 'facility/sops/Nexum_Suum_Cooling_Tower_Systems_SOP.docx',                         type: 'docx' },
  { label: 'Water Treatment SOP',                file: 'facility/sops/Nexum_Suum_Water_Treatment_and_Chemistry_SOP.docx',                 type: 'docx' },
  { label: 'Electrical & Controls SOP',          file: 'facility/sops/Nexum_Suum_Electrical_Electronics_and_Control_Systems_SOP.docx',    type: 'docx' },
  { label: 'Air Compressor SOP',                 file: 'facility/sops/Nexum_Suum_Air_Compressor_and_Dryer_Systems_SOP.docx',              type: 'docx' },
  { label: 'Feedwater & DA SOP',                 file: 'facility/sops/Nexum_Suum_Feedwater_Systems_DA_Expansion_Dump_Tanks_SOP.docx',     type: 'docx' },
  // Compliance
  { label: 'Compliance Handbook',                file: 'facility/compliance-templates/Nexum_Suum_Compliance_Handbook_PlayfairDisplay.docx',            type: 'docx' },
  { label: 'Compliance Reference Guide',         file: 'facility/compliance-templates/Nexum_Suum_Compliance_Reference_Boilers_Chillers_Facilities.docx', type: 'docx' },
  // Calculators / Dashboards
  { label: 'Facility Client Dashboard',          file: 'facility/calculators/NS-FAC-PRM-Facility_Client_Dashboard001.xlsx',                type: 'xlsx' },
  { label: 'Virtuous Ethical Logger',            file: 'facility/calculators/Organization Virtuous Ethical Logger.xlsx',                   type: 'xlsx' },
];

export const FACILITY_INTELLIGENCE: Product = {
  key: 'facility_intelligence',
  name: 'Facility Intelligence Package',
  description: 'Full facility system library: SOPs for all major facility systems, compliance templates, system log sheets, and troubleshooting workbooks.',
  priceId: 'price_1SzoRADfw4bOR2dfumakmsa5',
  price: 0,
  billing: 'one-time',
  category: 'facility',
  includes: [
    'Boiler, Chiller, Pump, AHU, Cooling Tower SOPs',
    'Water Treatment, Electrical, Air Compressor, Feedwater SOPs',
    'Compliance Handbook & Reference Guide',
    'Boiler & Chiller System Log Sheets',
    'Facility CTS System Logs (full series)',
    'Troubleshooting Workbooks',
    'Facility Client Dashboard (Excel)',
    'Virtuous Ethical Logger (Excel)',
  ],
  documents: FACILITY_DOCS,
};

export const FACILITY_INTELLIGENCE_ADVANCED: Product = {
  key: 'facility_intelligence_advanced',
  name: 'Facility Intelligence Package + Virtuous & Advanced Dashboards',
  description: 'Complete Facility Intelligence Package plus Virtuous ethical compliance tracking and advanced Looker Studio dashboards.',
  priceId: 'price_1SzoTkDfw4bOR2dfFzvTjft8',
  price: 0,
  billing: 'one-time',
  category: 'facility',
  includes: [
    'Everything in Facility Intelligence Package',
    'Virtuous Ethical Compliance Dashboard',
    'Advanced Looker Studio integration',
    'Organization performance tracking',
  ],
  documents: FACILITY_DOCS,
  lookerEmbedUrl:  '', // TODO: add Looker Studio embed URL when published
  dataEntrySheet:  '', // TODO: add Google Sheet ID when available
};

// ─────────────────────────────────────────────────────────────────────────────
// DOCUMENT PACKAGES
// These products are also wired to FIAS / Doc Gen in nexum-unified-gateway.
// Do not change priceIds without updating both repos.
// ─────────────────────────────────────────────────────────────────────────────

export const FACILITY_COMPLIANCE_GUIDE: Product = {
  key: 'facility_compliance_guide',
  name: 'Facility Compliance Guide',
  description: 'Comprehensive compliance reference covering boilers, chillers, and facility systems with regulatory checklists and documentation templates.',
  priceId: 'price_1SXBFODfw4bOR2dfmyLF5z3G',
  price: 0,
  billing: 'one-time',
  category: 'document',
  includes: [
    'Compliance Handbook (full)',
    'Boiler, Chiller & Facility Compliance Reference',
  ],
  documents: [
    { label: 'Compliance Handbook',         file: 'documents/Nexum_Suum_Compliance_Handbook_PlayfairDisplay.docx',            type: 'docx' },
    { label: 'Compliance Reference Guide',  file: 'documents/Nexum_Suum_Compliance_Reference_Boilers_Chillers_Facilities.docx', type: 'docx' },
  ],
  fiasDocGenKey: 'facility_compliance_guide',
};

export const THERMODYNAMICS_MAINTENANCE: Product = {
  key: 'thermodynamics_maintenance',
  name: 'Thermodynamics and Facility Maintenance',
  description: 'Educational guide covering thermodynamics principles applied to facility maintenance, boiler/chiller systems, and mechanical efficiency.',
  priceId: 'price_1SV2cQDfw4bOR2dfX1sXT8nT',
  price: 0,
  billing: 'one-time',
  category: 'document',
  includes: [
    'Thermodynamics principles for facility managers',
    'Applied boiler & chiller thermodynamics',
    'Mechanical efficiency guide',
  ],
  documents: [
    // TODO: file not in current zip — add when document is delivered
  ],
  fiasDocGenKey: 'thermodynamics_maintenance',
};

// Document Package — Checklist Only
// Also wired to FIAS Doc Gen in nexum-unified-gateway — do not change priceId without syncing.
export const DOCUMENT_CHECKLIST_ONLY: Product = {
  key: 'document_checklist_only',
  name: 'Document Package — Checklist Only',
  description: 'Standalone checklist package: all boiler, chiller, and facility system checklists for daily, weekly, and periodic inspections.',
  priceId: 'price_1TDr7PDfw4bOR2df1ogrNozX',
  price: 0,
  billing: 'one-time',
  category: 'document',
  includes: [
    'Boiler safety & log checklists (CKLST002–004)',
    'Weekly boiler log',
    'Chiller master checklist',
    'Chiller checklist module 3',
    'Cooling tower checklist',
    'Cooling system optimization sheet',
    'Facility CTS checklists (CKLT series)',
  ],
  documents: [
    // Boiler checklists
    { label: 'Boiler Checklist 2',            file: 'boiler/logs/NS-BLR-PRM-CKLST002.pdf',              type: 'pdf' },
    { label: 'Boiler Checklist 3',            file: 'boiler/logs/NS-BLR-PRM-CKLST003.pdf',              type: 'pdf' },
    { label: 'Boiler Checklist 4',            file: 'boiler/logs/NS-BLR-PRM-CKLST004.pdf',              type: 'pdf' },
    { label: 'Boiler Weekly Log',             file: 'boiler/logs/NS-BLR-PRM-WEEKLY001.pdf',             type: 'pdf' },
    // Chiller checklists
    { label: 'Chiller Master Checklist',      file: 'chiller/logs/NS-CHLLR-PRM-CHECKLIST001.pdf',       type: 'pdf' },
    { label: 'Chiller Checklist Module 3',    file: 'chiller/logs/NS-CHLLR-PRM-CKLST003.pdf',           type: 'pdf' },
    { label: 'Cooling Tower Checklist',       file: 'chiller/logs/NS-CHLLR-PRM-CT_CKLST003.pdf',        type: 'pdf' },
    { label: 'Cooling System Opt. Sheet',     file: 'chiller/logs/NS-CHLLR-PRM-CS_OPT002.pdf',          type: 'pdf' },
    // Facility CTS checklists
    { label: 'CTS Checklist 002',             file: 'facility/system-logs/Copy of NS-FAC-BUS-CTS-CKLT002.pdf', type: 'pdf' },
    { label: 'CTS Checklist 004',             file: 'facility/system-logs/Copy of NS-FAC-BUS-CTS-CKLT004.pdf', type: 'pdf' },
    { label: 'CTS Checklist 005',             file: 'facility/system-logs/Copy of NS-FAC-BUS-CTS-CKLT005.pdf', type: 'pdf' },
    { label: 'CTS Checklist 006',             file: 'facility/system-logs/Copy of NS-FAC-BUS-CTS-CKLT006.pdf', type: 'pdf' },
    { label: 'CTS Checklist 007',             file: 'facility/system-logs/Copy of NS-FAC-BUS-CTS-CKLT007.pdf', type: 'pdf' },
  ],
  fiasDocGenKey: 'document_checklist_only',
};

// Document Package — SOPs Only
// Also wired to FIAS Doc Gen in nexum-unified-gateway — do not change priceId without syncing.
export const DOCUMENT_SOPS_ONLY: Product = {
  key: 'document_sops_only',
  name: 'Document Package — SOPs Only',
  description: 'Complete SOPs for all major facility systems: boiler, chiller, pumps, AHU, cooling tower, water treatment, electrical, air compressor, and feedwater.',
  priceId: 'price_1TDr4nDfw4bOR2dfUcktuaXC',
  price: 0,
  billing: 'one-time',
  category: 'document',
  includes: [
    'Boiler SOP',
    'Chiller SOP',
    'Pump Systems SOP',
    'AHU & Ventilation SOP',
    'Cooling Tower SOP',
    'Water Treatment & Chemistry SOP',
    'Electrical & Controls SOP',
    'Air Compressor & Dryer SOP',
    'Feedwater / DA / Expansion / Dump Tank SOP',
  ],
  documents: [
    { label: 'Boiler SOP',                   file: 'facility/sops/Nexum_Suum_Boiler_SOP.docx',                                       type: 'docx' },
    { label: 'Chiller SOP',                   file: 'facility/sops/Nexum_Suum_Chiller_SOP.docx',                                      type: 'docx' },
    { label: 'Pump Systems SOP',              file: 'facility/sops/Nexum_Suum_Pump_Systems_SOP.docx',                                  type: 'docx' },
    { label: 'AHU & Ventilation SOP',         file: 'facility/sops/Nexum_Suum_AHU_and_Ventilation_Systems_SOP.docx',                   type: 'docx' },
    { label: 'Cooling Tower SOP',             file: 'facility/sops/Nexum_Suum_Cooling_Tower_Systems_SOP.docx',                         type: 'docx' },
    { label: 'Water Treatment SOP',           file: 'facility/sops/Nexum_Suum_Water_Treatment_and_Chemistry_SOP.docx',                 type: 'docx' },
    { label: 'Electrical & Controls SOP',     file: 'facility/sops/Nexum_Suum_Electrical_Electronics_and_Control_Systems_SOP.docx',    type: 'docx' },
    { label: 'Air Compressor SOP',            file: 'facility/sops/Nexum_Suum_Air_Compressor_and_Dryer_Systems_SOP.docx',              type: 'docx' },
    { label: 'Feedwater & DA SOP',            file: 'facility/sops/Nexum_Suum_Feedwater_Systems_DA_Expansion_Dump_Tanks_SOP.docx',     type: 'docx' },
  ],
  fiasDocGenKey: 'document_sops_only',
};

// ─────────────────────────────────────────────────────────────────────────────
// PRODUCT REGISTRY
// ─────────────────────────────────────────────────────────────────────────────

export const PRODUCTS: Record<ProductKey, Product> = {
  boiler_intelligence:           BOILER_INTELLIGENCE,
  boiler_intelligence_looker:    BOILER_INTELLIGENCE_LOOKER,
  chiller_intelligence:          CHILLER_INTELLIGENCE,
  chiller_intelligence_looker:   CHILLER_INTELLIGENCE_LOOKER,
  facility_intelligence:         FACILITY_INTELLIGENCE,
  facility_intelligence_advanced: FACILITY_INTELLIGENCE_ADVANCED,
  facility_compliance_guide:     FACILITY_COMPLIANCE_GUIDE,
  thermodynamics_maintenance:    THERMODYNAMICS_MAINTENANCE,
  document_checklist_only:       DOCUMENT_CHECKLIST_ONLY,
  document_sops_only:            DOCUMENT_SOPS_ONLY,
};

export const ALL_PRODUCTS = Object.values(PRODUCTS);

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────

/** Get a product by its Stripe price ID */
export function getProductByPriceId(priceId: string): Product | undefined {
  return ALL_PRODUCTS.find(p => p.priceId === priceId);
}

/** Get all documents for a purchased Stripe price ID */
export function getDocumentsForPriceId(priceId: string): LibraryDocument[] {
  return getProductByPriceId(priceId)?.documents ?? [];
}

/** Get all products in a category */
export function getProductsByCategory(category: ProductCategory): Product[] {
  return ALL_PRODUCTS.filter(p => p.category === category);
}

/** All Stripe price IDs — useful for webhook validation */
export const ALL_PRICE_IDS = ALL_PRODUCTS.map(p => p.priceId);

/** Price ID → Product key map for fast webhook lookup */
export const PRICE_ID_MAP: Record<string, ProductKey> = Object.fromEntries(
  ALL_PRODUCTS.map(p => [p.priceId, p.key])
);
