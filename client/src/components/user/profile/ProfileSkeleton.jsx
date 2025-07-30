// src/components/user/profile/ProfileSkeleton.jsx
import { useTheme } from '../../../contexts/ThemeContext';

const ProfileSkeleton = () => {
  const { theme } = useTheme();
  
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div 
        className="rounded-lg shadow-lg overflow-hidden animate-pulse"
        style={{ background: theme.cardBg }}
      >
        {/* Header skeleton */}
        <div 
          className="h-32 relative"
          style={{ background: theme.surface }}
        >
          <div className="absolute -bottom-16 left-8">
            <div 
              className="h-32 w-32 rounded-full border-4"
              style={{ 
                background: theme.glassBg,
                borderColor: theme.cardBorder
              }}
            ></div>
          </div>
        </div>
        
        {/* Content skeleton */}
        <div className="p-8 pt-20">
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-6">
              {/* Title skeleton */}
              <div 
                className="h-8 rounded-md w-3/4"
                style={{ background: theme.surface }}
              ></div>
              
              {/* Name fields skeleton */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div 
                    className="h-4 rounded-md w-1/2"
                    style={{ background: theme.surface }}
                  ></div>
                  <div 
                    className="h-10 rounded-md"
                    style={{ background: theme.surface }}
                  ></div>
                </div>
                <div className="space-y-2">
                  <div 
                    className="h-4 rounded-md w-1/2"
                    style={{ background: theme.surface }}
                  ></div>
                  <div 
                    className="h-10 rounded-md"
                    style={{ background: theme.surface }}
                  ></div>
                </div>
              </div>
              
              {/* Email skeleton */}
              <div className="space-y-2">
                <div 
                  className="h-4 rounded-md w-1/4"
                  style={{ background: theme.surface }}
                ></div>
                <div 
                  className="h-10 rounded-md"
                  style={{ background: theme.surface }}
                ></div>
                <div 
                  className="h-3 rounded-md w-2/3"
                  style={{ background: theme.surface }}
                ></div>
              </div>
              
              {/* Mobile skeleton */}
              <div className="space-y-2">
                <div 
                  className="h-4 rounded-md w-1/3"
                  style={{ background: theme.surface }}
                ></div>
                <div 
                  className="h-10 rounded-md"
                  style={{ background: theme.surface }}
                ></div>
                <div 
                  className="h-3 rounded-md w-2/3"
                  style={{ background: theme.surface }}
                ></div>
              </div>
            </div>
            
            <div className="space-y-6">
              {/* Title skeleton */}
              <div 
                className="h-8 rounded-md w-1/3"
                style={{ background: theme.surface }}
              ></div>
              
              {/* Country skeleton */}
              <div className="space-y-2">
                <div 
                  className="h-4 rounded-md w-1/4"
                  style={{ background: theme.surface }}
                ></div>
                <div 
                  className="h-10 rounded-md"
                  style={{ background: theme.surface }}
                ></div>
              </div>
              
              {/* State skeleton */}
              <div className="space-y-2">
                <div 
                  className="h-4 rounded-md w-1/5"
                  style={{ background: theme.surface }}
                ></div>
                <div 
                  className="h-10 rounded-md"
                  style={{ background: theme.surface }}
                ></div>
              </div>
              
              {/* City skeleton */}
              <div className="space-y-2">
                <div 
                  className="h-4 rounded-md w-1/6"
                  style={{ background: theme.surface }}
                ></div>
                <div 
                  className="h-10 rounded-md"
                  style={{ background: theme.surface }}
                ></div>
              </div>
              
              {/* Dates skeleton */}
              <div className="pt-4 space-y-2">
                <div 
                  className="h-4 rounded-md w-1/2"
                  style={{ background: theme.surface }}
                ></div>
                <div 
                  className="h-4 rounded-md w-1/2"
                  style={{ background: theme.surface }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileSkeleton;