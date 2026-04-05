import { useState } from "react";
import { Link } from "react-router-dom";
import { MapPin, Shield, Award, LogOut, LayoutDashboard, Menu, X, UserCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetClose } from "@/components/ui/sheet";

const Navbar = () => {
  const { user, loading, isAdmin, isProfessional, signOut } = useAuth();

  const navLinks = (
    <>
      <Link to="/search" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
        Find Services
      </Link>
      <Link to="/search" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
        Categories
      </Link>
      <div className="flex items-center gap-1 text-sm font-medium text-muted-foreground">
        <Shield className="w-3.5 h-3.5" />
        Trust & Safety
      </div>
    </>
  );

  const authLinks = loading ? null : (
    <>
      {user ? (
        <>
          {isAdmin && (
            <Link
              to="/admin"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              <LayoutDashboard className="w-4 h-4" />
              Dashboard
            </Link>
          )}
          <Link
            to="/profile"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            <UserCircle className="w-4 h-4" />
            My Profile
          </Link>
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            <LayoutDashboard className="w-4 h-4" />
            {isProfessional ? "Pro Dashboard" : "Dashboard"}
          </Link>
          {!isProfessional && (
            <Link
              to="/register"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-accent text-accent-foreground text-sm font-semibold hover:bg-accent/90 transition-colors"
            >
              <Award className="w-4 h-4" />
              Join as Pro
            </Link>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => signOut()}
            className="gap-1.5 text-muted-foreground"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </Button>
        </>
      ) : (
        <>
          <Link
            to="/auth"
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            Log in
          </Link>
          <Link
            to="/register"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-accent text-accent-foreground text-sm font-semibold hover:bg-accent/90 transition-colors"
          >
            <Award className="w-4 h-4" />
            Join as Pro
          </Link>
        </>
      )}
    </>
  );

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass safe-top">
      <div className="container mx-auto px-4 safe-x">
        <div className="flex items-center justify-between h-14 md:h-16">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center">
              <MapPin className="w-4 h-4 text-accent-foreground" />
            </div>
            <span className="font-display font-bold text-xl text-foreground">NearServ</span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks}
          </div>

          <div className="hidden md:flex items-center gap-3">
            {authLinks}
          </div>

          {/* Mobile hamburger */}
          <div className="md:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="text-foreground">
                  <Menu className="w-5 h-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-72 bg-card p-6">
                <div className="flex flex-col gap-6 mt-6">
                  <div className="flex flex-col gap-4">
                    <SheetClose asChild>
                      <Link to="/search" className="text-base font-medium text-foreground hover:text-accent transition-colors">
                        Find Services
                      </Link>
                    </SheetClose>
                    <SheetClose asChild>
                      <Link to="/search" className="text-base font-medium text-foreground hover:text-accent transition-colors">
                        Categories
                      </Link>
                    </SheetClose>
                    <div className="flex items-center gap-1.5 text-base font-medium text-muted-foreground">
                      <Shield className="w-4 h-4" />
                      Trust & Safety
                    </div>
                  </div>

                  <div className="border-t border-border pt-4 flex flex-col gap-3">
                    {loading ? null : user ? (
                      <>
                        {isAdmin && (
                          <SheetClose asChild>
                            <Link
                              to="/admin"
                              className="inline-flex items-center gap-1.5 text-base font-medium text-foreground hover:text-accent transition-colors"
                            >
                              <LayoutDashboard className="w-4 h-4" />
                              Admin
                            </Link>
                          </SheetClose>
                        )}
                        <SheetClose asChild>
                          <Link
                            to="/profile"
                            className="inline-flex items-center gap-1.5 text-base font-medium text-foreground hover:text-accent transition-colors"
                          >
                            <UserCircle className="w-4 h-4" />
                            My Profile
                          </Link>
                        </SheetClose>
                        <SheetClose asChild>
                          <Link
                            to="/dashboard"
                            className="inline-flex items-center gap-1.5 text-base font-medium text-foreground hover:text-accent transition-colors"
                          >
                            <LayoutDashboard className="w-4 h-4" />
                            {isProfessional ? "Pro Dashboard" : "Dashboard"}
                          </Link>
                        </SheetClose>
                        {!isProfessional && (
                          <SheetClose asChild>
                            <Link
                              to="/register"
                              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-accent text-accent-foreground text-sm font-semibold hover:bg-accent/90 transition-colors w-full justify-center"
                            >
                              <Award className="w-4 h-4" />
                              Join as Pro
                            </Link>
                          </SheetClose>
                        )}
                        <Button
                          variant="outline"
                          onClick={() => signOut()}
                          className="gap-1.5 w-full"
                        >
                          <LogOut className="w-4 h-4" />
                          Sign Out
                        </Button>
                      </>
                    ) : (
                      <>
                        <SheetClose asChild>
                          <Link
                            to="/auth"
                            className="inline-flex items-center justify-center px-4 py-2.5 rounded-xl border border-border text-sm font-medium text-foreground hover:bg-secondary transition-colors w-full"
                          >
                            Log in
                          </Link>
                        </SheetClose>
                        <SheetClose asChild>
                          <Link
                            to="/register"
                            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-accent text-accent-foreground text-sm font-semibold hover:bg-accent/90 transition-colors w-full justify-center"
                          >
                            <Award className="w-4 h-4" />
                            Join as Pro
                          </Link>
                        </SheetClose>
                      </>
                    )}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
