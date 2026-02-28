export const toISODate = (date: Date): string => date.toISOString().split('T')[0];

export const formatDateLabel = (isoDate: string): string => {
  const date = new Date(isoDate);
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  }).format(date);
};

export const nowISO = (): string => new Date().toISOString();
