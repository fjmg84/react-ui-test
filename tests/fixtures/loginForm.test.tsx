// UI Tests con el nuevo estilo: describe(Componente, (ctx) => ...)
// El componente se monta antes de cada test y se desmonta después.
// Los tests usan acciones (ctx.fill / ctx.click) en vez de fireEvent + screen.

import { describe, expect } from "../../dist/index";
import { LoginForm } from "./LoginForm";

describe(LoginForm, (ctx) => {
  it("permite llenar credenciales y hacer click en login", async () => {
    await ctx.fill("Email", "user@test.com");
    await ctx.fill("Contraseña", "secret123");
    await ctx.click("Iniciar sesión");

    await expect.toHaveValue("Email", "user@test.com");
    await expect.toHaveValue("Contraseña", "secret123");
  });

  it("muestra error cuando login falla", async () => {
    ctx.render({ onLogin: () => Promise.reject(new Error("fail")) });

    await ctx.fill("Email", "wrong@test.com");
    await ctx.fill("Contraseña", "wrong");
    await ctx.click("Iniciar sesión");

    await expect.toSee("Credenciales inválidas");
  });

  it("deshabilita inputs durante loading", async () => {
    let resolveLogin!: () => void;
    const loginPromise = new Promise<void>((res) => {
      resolveLogin = res;
    });
    
    ctx.render({ onLogin: () => loginPromise });

    await ctx.fill("Email", "user@test.com");
    await ctx.fill("Contraseña", "secret123");
    await ctx.click("Iniciar sesión");

    await expect.toBeDisabled("Email");

    resolveLogin();
    await expect.toBeEnabled("Email");
  });

  it("valida campos requeridos", async () => {
    await ctx.click("Iniciar sesión");

    await expect.toBeInvalid("Email");
    await expect.toBeInvalid("Contraseña");
  });
});
