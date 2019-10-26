import withExtLibraryHandler from './withExtLibraryHandler';
import Draggable from '@shopify/draggable/lib/draggable';

export default function(WrappedComponent, options) {
    return withExtLibraryHandler(WrappedComponent, function(container) {
        console.log(container);
        this.draggable = new Draggable(container, options);
        return this.draggable;
    }, function() {
        this.draggable.destroy();
    }, options);
}