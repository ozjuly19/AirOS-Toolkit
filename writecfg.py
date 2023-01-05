from lib.airos import api  # Internal API
import rich.progress
import time

if __name__ == '__main__':
    with rich.progress.Progress(rich.progress.SpinnerColumn(), rich.progress.TextColumn("[progress.description]{task.description}"),rich.progress.BarColumn()) as progress:
        task = progress.add_task("Working", total=1, start=False)
        time.sleep(1)  # Simulate work being done
        progress.start_task(task)
        progress.update(task, completed=1)
        
        time.sleep(1)