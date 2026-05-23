export const createAuditSlug = () => {
    const randomPart = crypto.randomUUID().slice(0, 8);
  
    return `audit-${randomPart}`;
  };