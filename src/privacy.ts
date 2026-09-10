export const privacyMarkup = String.raw`
<a class="skip-link" href="#privacy-content">Skip to privacy policy</a>

<header class="site-header privacy-header">
  <nav class="nav" aria-label="Primary navigation">
    <a class="brand" href="/" aria-label="Rapport home">rapport</a>
    <a class="nav-cta" href="/download">Try Rapport</a>
  </nav>
</header>

<main class="privacy-main" id="privacy-content">
  <section class="privacy-intro" aria-labelledby="privacy-title">
    <div class="privacy-intro__inner">
      <div class="privacy-intro__title">
        <h1 id="privacy-title">Privacy Policy</h1>
        <p class="privacy-effective">Effective September 10th, 2026</p>
      </div>

      <aside class="privacy-summary" aria-labelledby="privacy-summary-title">
        <h2 id="privacy-summary-title">The short version</h2>
        <p>
          Rapport’s Chrome extension sends the component you deliberately select
          only to the Rapport app running on your Mac, over a loopback connection
          at <strong>127.0.0.1</strong>. The extension does not send browsing data,
          screenshots, or component text to Rapport servers, advertisers, or
          analytics providers.
        </p>
      </aside>
    </div>
  </section>

  <section class="privacy-document" aria-label="Privacy policy">
    <div class="privacy-document__inner">
      <nav class="privacy-index" aria-label="Privacy policy sections">
        <p>On this page</p>
        <div class="privacy-index__links">
          <a href="#extension-data">What the extension handles</a>
          <a href="#data-use">How the data is used</a>
          <a href="#retention">Storage and retention</a>
          <a href="#permissions">Why permissions are requested</a>
          <a href="#security">Security and control</a>
          <a href="#changes">Changes and contact</a>
        </div>
      </nav>

      <article class="privacy-prose">
        <section id="extension-data">
          <h2>What the extension handles</h2>
          <p>During an active interaction session, the extension may handle:</p>
          <ul>
            <li>the URL and title of eligible open HTTP or HTTPS tabs;</li>
            <li>the visible text and screen bounds of the component you click;</li>
            <li>a screenshot of the active tab, cropped by the desktop app to the selected component; and</li>
            <li>a randomly generated local profile identifier used to keep browser sessions distinct.</li>
          </ul>
          <p>
            Rapport does not use the extension to collect browsing history or to
            observe components outside a session you start.
          </p>
        </section>

        <section id="data-use">
          <h2>How the data is used</h2>
          <p>
            The selected component is combined locally with any typed or spoken
            feedback you provide in Rapport. Rapport places the resulting text and
            cropped image in its structured clipboard bundle so you can paste them
            into an agent or another app. The extension uses no advertising,
            tracking, or sale of personal data.
          </p>
        </section>

        <section id="retention">
          <h2>Storage and retention</h2>
          <p>
            The extension stores only its random local profile identifier in Chrome
            extension storage. Selected component data is passed to the desktop app
            for the current operation and is not retained by the extension as a
            browsing archive. Rapport’s clipboard bundle remains available until
            you copy something else or replace it.
          </p>
        </section>

        <section id="permissions">
          <h2>Why permissions are requested</h2>
          <dl class="privacy-permissions">
            <div>
              <dt>Site access</dt>
              <dd>To draw the picker and identify the component you choose on ordinary HTTP and HTTPS pages.</dd>
            </div>
            <div>
              <dt>Tabs</dt>
              <dd>To identify eligible tabs and capture the active tab after a selection.</dd>
            </div>
            <div>
              <dt>Storage</dt>
              <dd>To retain the random local browser-profile identifier.</dd>
            </div>
          </dl>
        </section>

        <section id="security">
          <h2>Security and control</h2>
          <p>
            The extension accepts session state only from the local Rapport desktop
            bridge and verifies the expected protocol and extension identity. You
            choose when a session starts, which component is selected, what typed
            or spoken feedback is included, and when the session ends. Removing
            the extension or quitting Rapport stops the connection.
          </p>
        </section>

        <section id="changes">
          <h2>Changes and contact</h2>
          <p>
            Material changes to this policy will be posted here with a new effective
            date. Questions can be sent to
            <a href="mailto:prakki.rithvik@gmail.com">prakki.rithvik@gmail.com</a>.
          </p>
        </section>
      </article>
    </div>
  </section>
</main>

<footer class="footer privacy-footer">
  <div class="footer-inner">
    <div class="footer-brand">
      <a class="brand" href="/" aria-label="Rapport home">rapport</a>
    </div>
    <div class="footer-links">
      <div>
        <h3>Product</h3>
        <a href="/download">Download</a>
        <a href="/privacy" aria-current="page">Privacy</a>
      </div>
    </div>
  </div>
</footer>
`;
