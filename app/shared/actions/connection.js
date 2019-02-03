import * as types from './types';
import eos from './helpers/eos';
import { httpQueue, httpClient } from '../utils/httpClient';

export function setConnectionBroadcast(enable = true) {
  return (dispatch: () => void) => {
    dispatch({
      payload: { enable },
      type: types.SET_CONNECTION_BROADCAST
    });
  };
}

export function setConnectionSign(enable = true) {
  return (dispatch: () => void) => {
    dispatch({
      payload: { enable },
      type: types.SET_CONNECTION_SIGN
    });
  };
}

export function getSupportedCalls() {
  return (dispatch: () => void, getState) => {
    dispatch(getAvailableEndpoints());
    // /v1/api/get_available_endpoints
    dispatch(historyPluginCheck());
  };
}

export function getAvailableEndpoints() {
  return (dispatch: () => void, getState) => {
    const { connection } = getState();
    const { httpEndpoint } = connection;
    dispatch({
      type: types.FEATURES_AVAILABLE_ENDPOINTS_PENDING,
    });
    httpQueue.add(() =>
      httpClient
        .post(`${httpEndpoint}/v1/api/get_available_endpoints`)
        .then((response) => dispatch({
          type: types.FEATURES_AVAILABLE_ENDPOINTS_SUCCESS,
          payload: response.data
        }))
        .catch((err) => {
          console.log(err);
          dispatch({
            type: types.FEATURES_AVAILABLE_ENDPOINTS_FAILURE
          });
        }));
  };
}

export function historyPluginCheck() {
  return (dispatch: () => void, getState) => {
    const {
      connection,
    } = getState();
    let historyAccount;
    switch (connection.chainId) {
      case 'b912d19a6abd2b1b05611ae5be473355d64d95aeff0c09bedc8c166cd6468fe4': {
        historyAccount = 'beos.gateway';
        break;
      }
      case 'cbef47b0b26d2b8407ec6a6f91284100ec32d288a39d4b4bbd49655f7c484112': {
        historyAccount = 'beos.gateway';
        break;
      }
      default: {
        historyAccount = 'teamgreymass';
        break;
      }
    }
    return eos(connection).getActions(historyAccount).then((result) => dispatch({
      type: types.SET_CONNECTION_HISTORY_PLUGIN_ENABLED,
      payload: { enabled: (result.actions && result.actions.length !== 0) }
    })).catch(() => dispatch({
      type: types.SET_CONNECTION_HISTORY_PLUGIN_ENABLED,
      payload: { enabled: false }
    }));
  };
}

export function setChainId(chainId) {
  return (dispatch: () => void) => {
    dispatch({
      type: types.SET_CHAIN_ID,
      payload: { chainId }
    });
  };
}

export default {
  getSupportedCalls,
  historyPluginCheck,
  setChainId,
  setConnectionBroadcast,
  setConnectionSign,
};
