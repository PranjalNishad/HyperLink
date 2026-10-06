/**
 * Wires up password show/hide toggle buttons.
 *
 * A toggle is any `[data-password-toggle]` button whose attribute value is the
 * id of the input it controls. It flips the input between "password"/"text",
 * keeps ARIA labels in sync, and swaps the eye / eye-off icons.
 */
export function initPasswordToggles(root: ParentNode = document): void {
  root.querySelectorAll<HTMLButtonElement>("[data-password-toggle]").forEach((button) => {
    if (button.dataset.passwordToggleBound === "true") return;
    button.dataset.passwordToggleBound = "true";

    const targetId = button.getAttribute("data-password-toggle") ?? "";
    const input = targetId
      ? (document.getElementById(targetId) as HTMLInputElement | null)
      : null;
    if (!input) return;

    const showIcon = button.querySelector<SVGElement>('[data-password-icon="show"]');
    const hideIcon = button.querySelector<SVGElement>('[data-password-icon="hide"]');

    const setVisible = (visible: boolean) => {
      input.type = visible ? "text" : "password";
      button.setAttribute("aria-label", visible ? "Hide password" : "Show password");
      button.setAttribute("title", visible ? "Hide password" : "Show password");
      button.setAttribute("aria-pressed", visible ? "true" : "false");
      showIcon?.classList.toggle("hidden", visible);
      hideIcon?.classList.toggle("hidden", !visible);
    };

    setVisible(false);

    button.addEventListener("click", () => {
      setVisible(input.type === "password");
    });
  });
}
