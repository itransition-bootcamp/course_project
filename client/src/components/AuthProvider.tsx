import {
  FC,
  PropsWithChildren,
  createContext,
  memo,
  useContext,
  useEffect,
  useState,
} from "react";

type User = {
  id: string;
  username: string;
  avatar?: string;
  Likes: number[];
};

type UnformattedUser = Omit<User, "Likes"> & {
  Likes: { ReviewId: number }[];
};

type AuthRequestType = (
  username: FormDataEntryValue | null,
  password: FormDataEntryValue | null
) => Promise<{ success: boolean; message?: string }>;

type AuthContextType = {
  user: User | null;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  authenticated: boolean;
  loading: boolean;
  login: AuthRequestType;
  register: AuthRequestType;
  logout: () => void;
};
export function useAuth() {
  return useContext(AuthContext);
}
const AuthContext = createContext<AuthContextType>(null!);

const AuthProvider: FC<PropsWithChildren> = memo(({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [authenticated, setAuthenticated] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const abortController = new AbortController();
    async function fetchUser() {
      setLoading(true);
      fetch("/api/users/me", { signal: abortController.signal })
        .then((res) => res.json())
        .then((json) => {
          setAuthenticated(json.authenticated);
          setUser(formatUser(json.user));
          setLoading(false);
        });
    }
    fetchUser();
    return () => {
      abortController.abort();
    };
  }, []);

  const sendAuthRequest = async (
    username: FormDataEntryValue | null,
    password: FormDataEntryValue | null,
    reqType: string
  ) => {
    if (!username || !password)
      return { success: false, message: "Missing Credentials" };

    const response = await fetch(`/auth/${reqType}`, {
      method: "post",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username,
        password,
      }),
    });

    const json = await response.json();
    if (response.ok && json.user) {
      setUser(formatUser(json.user));
      setAuthenticated(true);
      return { success: true };
    } else {
      return { success: false, message: json.message };
    }
  };

  const formatUser = (user: UnformattedUser) => {
    if (!user) return null;
    return {
      ...user,
      Likes: user.Likes
        ? user.Likes.map((like: { ReviewId: number }) => like.ReviewId)
        : [],
    };
  };

  const logout = () => {
    fetch("/auth/logout").then(() => {
      setUser(null);
      setAuthenticated(false);
    });
  };

  const login: AuthRequestType = (username, password) => {
    return sendAuthRequest(username, password, "login");
  };
  const register: AuthRequestType = (username, password) => {
    return sendAuthRequest(username, password, "register");
  };

  const value: AuthContextType = {
    user,
    setUser,
    authenticated,
    loading,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
});

export default AuthProvider;
