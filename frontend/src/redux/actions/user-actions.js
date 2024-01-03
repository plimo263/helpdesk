import fetchRedux from "../../api/fetch_redux";

const ROUTES = ["/profile_user"];

export const USER_INIT = "USER_INIT";

export const userInit = () => (dispatch) => {
  fetchRedux(
    ROUTES[0],
    "GET",
    null,
    (response) => {
      dispatch({
        type: USER_INIT,
        data: response,
      });
    },
    () => {},
    (err) => {}
  );
};
