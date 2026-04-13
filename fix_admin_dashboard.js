const fs = require('fs');
const content = fs.readFileSync('src/views/AdminDashboard.tsx', 'utf8');
const lines = content.split('\n');

const dashboardCode = lines.slice(725, 922).join('\n'); // lines are 0-indexed in array, so 725 to 921 is 726..922

const newCode = `          {adminTab === 'Dashboard' ? (
            <>
              {isDashboardLoading ? (
                <div className="space-y-4">
                  <Skeleton className="h-32 w-full" />
                  <Skeleton className="h-72 w-full" />
                </div>
              ) : hasDashboardError ? (
                <ErrorState
                  error={{
                    code: 'ADMIN_DASHBOARD_FAILED',
                    message:
                      typeof hasDashboardError === 'object' && hasDashboardError !== null && 'message' in hasDashboardError
                        ? String((hasDashboardError as { message: unknown }).message)
                        : 'Unable to load dashboard data.'
                  }}
                />
              ) : (
${dashboardCode}
              )}
            </>
          ) : null}`;

const before = lines.slice(0, 706).join('\n');
const after = lines.slice(1065).join('\n');

fs.writeFileSync('src/views/AdminDashboard.tsx', before + '\n' + newCode + '\n' + after);
console.log('Fixed');
