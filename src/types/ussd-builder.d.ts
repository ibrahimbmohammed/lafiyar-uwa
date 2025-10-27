/** @format */

// // types/ussd-builder.d.ts
// declare module "ussd-builder" {
//   interface UssdStateOptions {
//     args: {
//       phoneNumber: string;
//       [key: string]: any;
//     };
//     val: string;
//     session: any;
//     end: (msg: string) => void;
//     con: (msg: string) => void;
//   }

//   class UssdMenu {
//     constructor();
//     startState(options: {
//       run: (
//         this: UssdStateOptions
//       ) => string | Promise<string> | void | Promise<void>;
//       next?: any;
//     }): void;
//     state(
//       name: string,
//       options: {
//         run: (
//           this: UssdStateOptions
//         ) => string | Promise<string> | void | Promise<void>;
//         next?: any;
//       }
//     ): void;
//     run(args: any): Promise<string>;
//     end(msg: string): void;
//     con(msg: string): void;
//   }

//   export default UssdMenu;
// }


/** @format */

// types/ussd-builder.d.ts
declare module "ussd-builder" {
  /**
   * Arguments passed to USSD state functions
   */
  interface UssdGatewayArgs {
    phoneNumber: string;
    sessionId: string;
    serviceCode: string;
    text: string;
    [key: string]: any; // Allow additional dynamic properties
  }

  /**
   * Context available within USSD state run functions
   */
  interface UssdStateOptions {
    args: UssdGatewayArgs;
    val: string; // Current user input
    session: any; // Session data (ussd-builder internal)
  }

  /**
   * State configuration options
   */
  interface UssdStateConfig {
    run: (
      this: UssdStateOptions
    ) => string | void | Promise<string> | Promise<void>;
    next?: {
      [input: string]: string; // Maps user input to next state
    };
  }

  /**
   * Main USSD Menu class
   */
  class UssdMenu {
    constructor();

    /**
     * Define the starting state of the USSD menu
     */
    startState(options: UssdStateConfig): void;

    /**
     * Define a named state in the USSD menu
     */
    state(name: string, options: UssdStateConfig): void;

    /**
     * Run the USSD menu with given arguments
     * @returns Response string (starts with "CON" or "END")
     */
    run(args: UssdGatewayArgs): Promise<string>;

    /**
     * End the USSD session with a message
     */
    end(msg: string): void;

    /**
     * Continue the USSD session with a message (prompt for more input)
     */
    con(msg: string): void;
  }

  export default UssdMenu;
  export { UssdStateOptions, UssdGatewayArgs, UssdStateConfig };
}