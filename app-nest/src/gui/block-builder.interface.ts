import {
  Appendable,
  BlockBuilder as BlockBuilderType,
} from "slack-block-builder/dist/internal";

/**
 * Interface for classes that build views with `slack-block-builder`.
 *
 * Type parameter should be imported from `slack-block-builder` with respect
 * to the intended consumer of the class implementing this interface. This way
 * the library's type system will take care of checking that only allowed
 * blocks are used throughout the block tree.
 */
export interface BlockBuilder<T extends BlockBuilderType> {
  build(...args: unknown[]): Appendable<T> | Promise<Appendable<T>>;
}
