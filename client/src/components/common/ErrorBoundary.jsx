//src/components/common/ErrorBoundary.jsx
import React from 'react';
import PropTypes from 'prop-types';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import Logger from '../../utils/logger';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
    
    // Log error to backend
    Logger.logError(error, {
      componentStack: errorInfo.componentStack,
      props: this.props
    });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-[#121214] p-4">
          <div className="text-center max-w-lg">
            <div className="flex justify-center mb-6">
              <AlertTriangle size={64} className="text-[#efc230]" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-4">
              Oops! Something went wrong
            </h1>
            <p className="text-gray-400 mb-8">
              We apologize for the inconvenience. Please try refreshing the page or contact support if the problem persists.
            </p>
            <button
              onClick={this.handleReset}
              className="flex items-center gap-2 px-6 py-3 bg-[#efc230] text-black rounded-lg mx-auto hover:bg-[#f4d160] transition-colors"
            >
              <RefreshCw size={20} />
              Try Again
            </button>
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <div className="mt-8 text-left">
                <details className="bg-[#1a1a1d] rounded-lg p-4">
                  <summary className="text-white cursor-pointer mb-2">Error Details</summary>
                  <pre className="text-red-400 text-sm overflow-auto p-2">
                    {this.state.error.toString()}
                  </pre>
                  <pre className="text-gray-400 text-sm overflow-auto p-2">
                    {this.state.errorInfo.componentStack}
                  </pre>
                </details>
              </div>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

ErrorBoundary.propTypes = {
  children: PropTypes.node.isRequired
};

export default ErrorBoundary;