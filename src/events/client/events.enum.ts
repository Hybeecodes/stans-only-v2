export enum Events {
  ON_REGISTRATION = 'onRegistration',
  ON_FORGOT_PASSWORD = 'onForgotPassword',
  CREATE_POST_MEDIA = 'createPostMedia',
  ON_NEW_COMMENT = 'comment.new',
  ON_NEW_LIKE = 'like.new',
  ON_UNLIKE = 'like.remove',
  ON_NEW_SUBSCRIPTION = 'subscription.new',
  ON_NEW_USER_BLOCK = 'block.new.user',
  ON_USER_UNBLOCK = 'block.user.remove',
  ON_REMOVE_SUBSCRIPTION = 'subscription.remove',
  NEW_NOTIFICATION = 'notification.new',
}
