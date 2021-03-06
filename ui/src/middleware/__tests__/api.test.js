import * as R from 'ramda';
import ActionTypes from 'constants/actions';
import ApiMiddleware from '../api';
import configureStore from 'redux-mock-store';
import sinon from 'sinon';
import { normalize, schema } from 'normalizr';


describe('API Middleware', function() {
  const body = { category: '"S" Words' };
  const endpoint = "It's a big hat. It's funny.";
  const failureType = 'Celebrity Jeopardy';
  const requestType = 'The only month that starts with Feb';
  const successType = 'Febtober!';
  let fetchStub;

  const options = {
    body,
    method: 'Turd Ferguson'
  };

  const action = {
    type: ActionTypes.Api.CALL,
    payload: {
      endpoint,
      options,
      types: [requestType, successType, failureType]
    }
  };

  const store = configureStore([ApiMiddleware])({});

  before(function() {
    fetchStub = sinon.stub(global, 'fetch');
  });

  after(function() {
    fetchStub.restore();
  });

  afterEach(function() {
    fetchStub.resetHistory();
    store.clearActions();
  });

  context('when the action is not an API call', function() {
    const otherAction = { type: 'Swords for 200' };
    let firstDispatchedAction;

    beforeEach(async function() {
      await store.dispatch(otherAction);
      [firstDispatchedAction] = store.getActions();
    });

    it('dispatches the action unchanged', function() {
      expect(firstDispatchedAction).to.eql(otherAction);
    });

    it('does not dispatch any other action', function() {
      expect(store.getActions()).to.have.lengthOf(1);
    });
  });

  context('when the action is an API call', function() {
    let resultAction, returnValue;

    context('when making the request', function() {
      let firstDispatchedAction;

      beforeEach(async function() {
        fetchStub.resolves(new Response(JSON.stringify({ host: 'Alex Trebek' }), { status: 200 }));

        await store.dispatch(action);
        [firstDispatchedAction] = store.getActions();
      });

      it('dispatches an action using the provided request type', function() {
        expect(firstDispatchedAction).to.eql(Object.assign({}, action, { type: requestType }));
      });

      it('stringifies the provided body, uses CORS, JSON, and all provided parameters', function() {
        expect(fetchStub).to.be.calledWith(endpoint, Object.assign({}, options, {
          body: JSON.stringify(body),
          headers: {
            'Content-Type': 'application/json'
          },
          mode: 'cors'
        }));
      });
    });

    context('when the request fails', function() {
      context('always', function() {
        const mockError = { message: 'Welcome back to another episode of Celebrity Jeopardy' };
        let resultActionWithoutPayload;

        const assertedAction = { error: true, payload: new Error(mockError), type: failureType };
        const assertedActionWithoutPayload = R.omit(['payload'], assertedAction);

        const failedResponse = new Response(JSON.stringify(mockError), { status: 500 });

        beforeEach(async function() {
          fetchStub.resolves(failedResponse.clone());

          await store.dispatch(action);
          [, resultAction] = store.getActions();

          resultActionWithoutPayload = R.omit(['payload'], resultAction);
        });

        it('dispatches an action with the error and provided failure type', function() {
          // Avoiding deep equal here because Error's need same ref to pass
          expect(resultActionWithoutPayload).to.eql(assertedActionWithoutPayload);
          expect(resultAction.payload.message).to.equal(assertedAction.payload.message);
        });
      });
    });

    context('when the request succeeds', function() {
      const response = [
        { category: 'Potent Potables', id: 0 },
        { category: 'Famous Horseman', id: 1 }
      ];
      const successResponse = new Response(JSON.stringify(response), { status: 200 });

      beforeEach(function() {
        fetchStub.resolves(successResponse.clone());
      });

      context('and a schema is provided', function() {
        const categorySchema = new schema.Entity('categories');
        const categoryListSchema = [categorySchema];

        const assertedAction = {
          payload: normalize(response, categoryListSchema),
          type: successType
        };

        beforeEach(async function() {
          const actionWithSchema = R.mergeDeepRight(action, {
            payload: { schema: categoryListSchema }
          });

          returnValue = await store.dispatch(actionWithSchema);
          [, resultAction] = store.getActions();
        });

        it('dispatches an action with the normalized payload and the provided success type',
          function() {
            expect(resultAction).to.eql(assertedAction);
          }
        );

        it('returns the dispatched action', function() {
          expect(returnValue).to.eql(assertedAction);
        });
      });

      context('and a schema is not provided', function() {
        beforeEach(async function() {
          await store.dispatch(action);
          [, resultAction] = store.getActions();
        });

        it('dispatches an action with the raw payload and the provided success type', function() {
          expect(resultAction).to.eql({ payload: response, type: successType });
        });
      });
    });
  });
});
