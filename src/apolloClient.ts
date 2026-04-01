import { ApolloClient, InMemoryCache, createHttpLink, from } from '@apollo/client/core/index.js';
import { setContext } from '@apollo/client/link/context/index.js';
import { onError } from '@apollo/client/link/error/index.js';
import { toast } from 'react-hot-toast';
import { store } from './app/store';

// This will automatically pick the correct URL based on your environment
const httpLink = createHttpLink({
  uri: import.meta.env.VITE_API_URL || 'http://localhost:4002/graphql',
});

const errorLink = onError(({ graphQLErrors, networkError }: any) => {
  if (graphQLErrors) {
    graphQLErrors.forEach(({ message }: { message: string }) => {
      // Don't show toast for "Moderation" errors as they are handled in the form
      if (!message.toLowerCase().includes('moderation')) {
        toast.error(`Error: ${message}`);
      }
    });
  }
  if (networkError) {
    if ((networkError as any).statusCode === 413) {
      toast.error("This photo is too large for the internet! Please try a smaller file or a screenshot (under 4MB).");
    } else {
      toast.error(`Network Connection Error: Please check your internet.`);
    }
  }
});

const authLink = setContext((_, { headers }) => {
  // get the authentication token from local state if it exists
  const state = store.getState();
  const token = state.auth.token;
  // return the headers to the context so httpLink can read them
  return {
    headers: {
      ...headers,
      authorization: token ? token : "",
    }
  }
});

export const client = new ApolloClient({
  link: from([errorLink, authLink.concat(httpLink)]),
  cache: new InMemoryCache({
    typePolicies: {
      Query: {
        fields: {
          getProducts: {
            merge(existing, incoming) {
              return incoming;
            },
          },
        },
      },
    },
  }),
});
