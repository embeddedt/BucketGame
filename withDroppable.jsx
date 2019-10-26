import withExtLibraryHandler from './withExtLibraryHandler';
import Droppable from '@shopify/draggable/lib/droppable';

export default function(WrappedComponent, options) {
    return withExtLibraryHandler(WrappedComponent, function(container) {
        console.log(container);
        this.droppable = new Droppable(container, options);
        return this.droppable;
    }, function() {
        this.droppable.destroy();
    }, options);
}