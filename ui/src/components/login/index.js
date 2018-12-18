import FullLogo from 'icons/full_logo';
import PropTypes from 'prop-types';
import React from 'react';
import withField from 'hocs/with_field';
import {Field} from 'redux-form';
import {PrimaryButton} from 'components/buttons';
import {InlineErrorNotification} from 'components/inline_notifications';

const InputField = withField('input');

const Login = ({error, handleSubmit, submitting}) =>
  <div className='login-form-wrapper'>
    <FullLogo />
    <form className='login-form' noValidate onSubmit={handleSubmit}>
      {error && <InlineErrorNotification message={error} />}
      <Field
        component={InputField}
        label='Email'
        name='email'
        type='email' />
      <Field
        component={InputField}
        label='Password'
        name='password'
        type='password' />
      <PrimaryButton
        disabled={submitting}
        text='Login'
        type='submit'/>
    </form>
  </div>;

Login.propTypes = {
  error: PropTypes.string,
  handleSubmit: PropTypes.func.isRequired,
  submitting: PropTypes.bool
};

export default Login;
