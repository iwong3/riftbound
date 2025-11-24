import { BrowserRouter, Route, Routes } from "react-router-dom";

import { Main } from "views/main";

enum Path {
  HOME = "/",
}

const routes = [
  {
    path: Path.HOME,
    component: () => {
      return <Main />;
    },
  },
];

export const MainRouter = () => {
  return (
    <BrowserRouter basename={process.env.PUBLIC_URL}>
      <Routes>
        {routes.map(({ path, component }) => (
          <Route key={path} path={path} element={component()} />
        ))}
      </Routes>
    </BrowserRouter>
  );
};
