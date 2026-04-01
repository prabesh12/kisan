import { ApolloClient, InMemoryCache, createHttpLink } from '@apollo/client/core/index.js';
import { setContext } from '@apollo/client/link/context/index.js';
import { store } from './app/store';

// Replace with your backend URL if it changes
const httpLink = createHttpLink({
  uri: 'https://kisan-backend-45lp11ilg-prabesholi8848-7604s-projects.vercel.app/graphql',
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
  link: authLink.concat(httpLink),
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
