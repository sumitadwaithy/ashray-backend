/**
 * CENTRALIZED ID GENERATION ENGINE
 * 
 * RULE: PREFIX/AG/YYYYMMDD/NNNNN
 * Example: CID/AG/20260422/00785
 * 
 * Constraints:
 * 1. Serial Number (NNNNN) must be sequential.
 * 2. Serial Number (NNNNN) must be unique across ALL types (Clients, Staff, etc.).
 * 3. Serial Number starts at 00785.
 */

export const ID_CONFIG = {
  COMPANY_CODE: 'AG',
  START_SERIAL: 785,
  SERIAL_LENGTH: 5,
};

export function formatGeneratedId(prefix: string, date: Date, serial: number): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const dateStr = `${year}${month}${day}`;
  
  const serialStr = String(serial).padStart(ID_CONFIG.SERIAL_LENGTH, '0');
  
  return `${prefix}/${ID_CONFIG.COMPANY_CODE}/${dateStr}/${serialStr}`;
}

/**
 * Note: The actual stateful generation (calculating the next serial) 
 * happens in the Database Backend (server.ts) to ensure atomicity 
 * and absolute uniqueness across multiple clients.
 */
