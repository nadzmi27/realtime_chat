import { Link } from "react-router-dom";
import { UserAuth } from "../context/AuthContext";
import { Button } from "./ui/button";

const Navigation = () => {
  const { user, signOut} = UserAuth();
  const style = "text-xl font-bold";
  const padding = {};

    const handleSignOut = async (e) => {
    e.preventDefault()
    try{
      await signOut()
      navigate('/')
    } catch (err) {
      console.error(err)
    }
  };


  return (
    <div className="border-b bg-background h-header">
      <nav className="container mx-auto px-4 flex justify-between items-center h-full gap-4">
        <Link className={style} to="/">
          Main Screen
        </Link>
        <Link className={style} to="/dashboard">
          Dashboard
        </Link>
        {!user ? (
          <>
            <Link className={style} to="/signin">
              Signin
            </Link>
            <Link className={style} to="/signup">
              Signup
            </Link>
          </>
        ) : (
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
              {user?.email}
              <Button
                onClick={handleSignOut}
                variant="outline"
                size="sm"
                // className="hover:cursor-pointer border inline-block"
              >
                Sign out
              </Button>
            </span>
          </div>
        )}
      </nav>
    </div>
  );
};

export default Navigation;
