export function handleSupabaseError(error, context = '') {
  console.error(`[${context}]`, error);

  if (!error) return 'An unknown error occurred';

  const message = error.message || '';

  if (message.includes('new row violates row-level security')) {
    return 'You do not have permission to perform this action';
  }

  if (message.includes('relation does not exist') || message.includes('table')) {
    return 'Database table not found. Check RLS policies are set up correctly';
  }

  if (message.includes('JWT expired') || message.includes('jwt')) {
    return 'Session expired. Please log in again';
  }

  if (message.includes('no rows') || message.includes('PGRST116')) {
    return 'Record not found';
  }

  if (message.includes('duplicate key') || message.includes('unique')) {
    return 'This value already exists. Please use a different one';
  }

  if (message.includes('not authenticated')) {
    return 'You must be logged in to perform this action';
  }

  if (message.includes('forbidden')) {
    return 'Access denied';
  }

  if (message.includes('network') || message.includes('Failed to fetch')) {
    return 'Network error. Please check your connection';
  }

  return message || 'An unexpected error occurred';
}

export function isAuthError(error) {
  const message = error?.message || '';
  return message.includes('auth') || message.includes('JWT') || message.includes('authenticated');
}

export function isPermissionError(error) {
  const message = error?.message || '';
  return message.includes('row-level security') || message.includes('forbidden') || message.includes('permission');
}

export function isNetworkError(error) {
  const message = error?.message || '';
  return message.includes('network') || message.includes('Failed to fetch') || message.includes('ECONNREFUSED');
}
